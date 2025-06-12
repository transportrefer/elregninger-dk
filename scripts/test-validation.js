#!/usr/bin/env node

/**
 * Danish Bill Validation Test Script
 * 
 * Automatically tests all bills in test-bills/ directory against the API
 * and generates a comprehensive validation report.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api/analyze';
const TEST_DIR = path.join(__dirname, '../test-bills');
const RESULTS_DIR = path.join(TEST_DIR, 'results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Test a single bill file
 */
async function testBill(filePath) {
  const filename = path.basename(filePath);
  console.log(`Testing: ${filename}`);
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    return {
      filename,
      success: response.ok,
      status: response.status,
      tier: result.tier || 'failed',
      data: result.data || null,
      error: result.error || null,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      filename,
      success: false,
      status: 500,
      tier: 'failed',
      data: null,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate extracted data against expected tiers
 */
function validateTiers(data) {
  const tier1 = data?.totalConsumption_kWh && data?.totalAmountForConsumption_DKK;
  const tier2 = tier1 && data?.providerName && data?.costBreakdown_DKK && data?.consumptionPeriod;
  const tier3 = tier2 && data?.priceType && data?.isGreenEnergy !== null;
  
  return {
    tier1: !!tier1,
    tier2: !!tier2,
    tier3: !!tier3
  };
}

/**
 * Generate validation report
 */
function generateReport(results) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  
  // Tier validation
  const tierResults = results.map(r => ({
    filename: r.filename,
    success: r.success,
    ...validateTiers(r.data)
  }));
  
  const tier1Success = tierResults.filter(r => r.tier1).length;
  const tier2Success = tierResults.filter(r => r.tier2).length;
  const tier3Success = tierResults.filter(r => r.tier3).length;
  
  // Provider analysis
  const providerStats = {};
  results.forEach(r => {
    if (r.data?.providerName) {
      const provider = r.data.providerName;
      if (!providerStats[provider]) {
        providerStats[provider] = { total: 0, successful: 0 };
      }
      providerStats[provider].total++;
      if (r.success) providerStats[provider].successful++;
    }
  });
  
  const report = {
    summary: {
      totalBills: total,
      successfulRequests: successful,
      overallSuccessRate: `${((successful / total) * 100).toFixed(1)}%`,
      tier1SuccessRate: `${((tier1Success / total) * 100).toFixed(1)}%`,
      tier2SuccessRate: `${((tier2Success / total) * 100).toFixed(1)}%`,
      tier3SuccessRate: `${((tier3Success / total) * 100).toFixed(1)}%`,
      combinedTier12Rate: `${((tier2Success / total) * 100).toFixed(1)}%`
    },
    tierBreakdown: {
      tier1Critical: `${tier1Success}/${total} bills`,
      tier2Important: `${tier2Success}/${total} bills`, 
      tier3NiceToHave: `${tier3Success}/${total} bills`
    },
    providerStats,
    detailedResults: tierResults,
    errors: results.filter(r => !r.success).map(r => ({
      filename: r.filename,
      error: r.error,
      status: r.status
    })),
    timestamp: new Date().toISOString()
  };
  
  return report;
}

/**
 * Main execution
 */
async function runValidation() {
  console.log('🧪 Starting Danish Bill Validation Test');
  console.log('=====================================\n');
  
  // Find all test files
  const testFiles = [];
  const subdirs = ['pdf', 'images'];
  
  for (const subdir of subdirs) {
    const dirPath = path.join(TEST_DIR, subdir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
        .filter(f => /\.(pdf|png|jpg|jpeg)$/i.test(f))
        .map(f => path.join(dirPath, f));
      testFiles.push(...files);
    }
  }
  
  if (testFiles.length === 0) {
    console.log('❌ No test files found in test-bills/pdf/ or test-bills/images/');
    console.log('Please add some Danish electricity bills to test.');
    process.exit(1);
  }
  
  console.log(`Found ${testFiles.length} test files\n`);
  
  // Test each file
  const results = [];
  for (const filePath of testFiles) {
    const result = await testBill(filePath);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    const tier = result.tier || 'failed';
    console.log(`${status} ${result.filename} - ${tier}`);
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Generating validation report...');
  
  // Generate and save report
  const report = generateReport(results);
  const reportPath = path.join(RESULTS_DIR, `validation-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  console.log('\n🎯 VALIDATION RESULTS');
  console.log('===================');
  console.log(`Total Bills Tested: ${report.summary.totalBills}`);
  console.log(`Overall Success Rate: ${report.summary.overallSuccessRate}`);
  console.log(`Tier 1 (Critical): ${report.summary.tier1SuccessRate}`);
  console.log(`Tier 2 (Important): ${report.summary.tier2SuccessRate}`);
  console.log(`Combined Tier 1+2: ${report.summary.combinedTier12Rate}`);
  console.log(`Tier 3 (Nice-to-have): ${report.summary.tier3SuccessRate}`);
  
  console.log('\n📈 Provider Performance:');
  Object.entries(report.providerStats).forEach(([provider, stats]) => {
    const rate = ((stats.successful / stats.total) * 100).toFixed(1);
    console.log(`  ${provider}: ${stats.successful}/${stats.total} (${rate}%)`);
  });
  
  if (report.errors.length > 0) {
    console.log('\n❌ Errors:');
    report.errors.forEach(error => {
      console.log(`  ${error.filename}: ${error.error}`);
    });
  }
  
  console.log(`\n📄 Full report saved: ${reportPath}`);
  
  // Success criteria check
  const tier12Rate = parseFloat(report.summary.combinedTier12Rate);
  if (tier12Rate >= 80) {
    console.log('\n🎉 SUCCESS: Achieved 80%+ Tier 1+2 success rate!');
    console.log('✅ Technical spike validation PASSED - ready for MVP development');
  } else {
    console.log('\n⚠️  NEEDS IMPROVEMENT: Below 80% Tier 1+2 success rate');
    console.log('🔧 Consider refining prompts or validation logic');
  }
}

// Run if called directly
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { runValidation, testBill, validateTiers, generateReport };