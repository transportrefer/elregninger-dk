# Danish Bill Testing Plan - Technical Spike Validation

## Objective
Validate 80%+ success rate on Tier 1+2 extraction across diverse Danish electricity bills before proceeding with full MVP development.

## Test Bill Requirements

### Provider Diversity (Target: 8-10 different providers)
- [ ] **Andel Energi** (cooperative)
- [ ] **Norlys** (major utility)  
- [ ] **Ørsted** (former monopoly)
- [ ] **Ewii** (Jutland focused)
- [ ] **E.ON** (international)
- [ ] **Vindstød** (✅ already tested - 100% success)
- [ ] **Energi Fyn**
- [ ] **Energi Nord**
- [ ] **Radius**
- [ ] **Clever**

### Bill Type Diversity
- [ ] **Final Settlement** (slutafregning)
- [ ] **Periodic Bill** (månedsopgørelse)  
- [ ] **Quarterly Bill** (kvartalsregning)
- [ ] **Green Energy** vs **Standard Mix**
- [ ] **Fixed Price** vs **Variable/Spot Price**
- [ ] **Private Household** vs **Small Business**

### Format Diversity
- [ ] **PDF bills** (most common)
- [ ] **High-quality PNG/JPG** (scanned)
- [ ] **Mobile photos** (realistic user scenario)
- [ ] **Different layouts** (old vs new formats)

### Data Complexity
- [ ] **Simple bills** (basic consumption)
- [ ] **Complex bills** (multiple tariffs, fees)
- [ ] **Multi-period bills** (seasonal rates)
- [ ] **Bills with refunds/credits**
- [ ] **High consumption** (>1000 kWh)
- [ ] **Low consumption** (<100 kWh)

## Success Criteria

### Tier 1 (Critical) - Must achieve 90%+
- `totalConsumption_kWh` extracted correctly
- `totalAmountForConsumption_DKK` extracted correctly

### Tier 2 (Important) - Must achieve 80%+  
- `providerName` recognized correctly
- `costBreakdown_DKK` with major components
- `consumptionPeriod` dates extracted

### Tier 3 (Nice-to-have) - Target 60%+
- `priceType` classification
- `isGreenEnergy` detection  
- `pricePeriods` detailed breakdowns

## Testing Protocol

### 1. Manual Collection Phase
```bash
# Create test directory (already in .gitignore)
mkdir -p test-bills/
mkdir -p test-bills/pdf/
mkdir -p test-bills/images/
mkdir -p test-bills/results/
```

### 2. Automated Testing Script
Create `scripts/test-validation.js` to:
- Process all bills in test directory
- Record success rates by tier
- Generate detailed validation report
- Track provider-specific performance

### 3. Validation Metrics
- **Overall success rate** (Tier 1+2 combined)
- **Provider-specific rates** (identify problematic formats)  
- **Format-specific rates** (PDF vs image quality)
- **Error categorization** (parsing vs validation vs AI)

### 4. Iteration Protocol
- If <80% success rate: refine prompts and validation
- If 80-90%: acceptable for MVP launch
- If >90%: excellent, proceed with confidence

## Test Data Sources

### Primary Sources
1. **User submissions** (anonymized real bills)
2. **Provider websites** (sample bill formats)
3. **Energy comparison sites** (example bills)
4. **Community forums** (/r/dkfinance examples)

### Data Privacy
- All test bills must be anonymized
- Remove personal data (names, addresses, account numbers)
- Keep only relevant consumption and cost data
- Store in local test directory (excluded from git)

## Current Status
- ✅ **Vindstød bill**: 100% Tier 1+2 success
- 🎯 **Target**: 10-15 additional bills for validation
- 📊 **Goal**: 80%+ overall Tier 1+2 success rate

## Next Steps
1. Create test infrastructure and scripts
2. Collect diverse bill samples
3. Run validation batch testing
4. Analyze results and refine if needed
5. Document final success metrics
6. Decision: Proceed with MVP or iterate prompts