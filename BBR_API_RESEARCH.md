# BBR API Research & Implementation Analysis

**Date:** December 6, 2025  
**Research Focus:** Danish Building Registry (BBR) API Integration for elregninger.dk MVP  
**Status:** Technical Feasibility Assessment Complete

## Executive Summary

The Danish Building Registry (BBR) API provides comprehensive building data that aligns well with elregninger.dk's requirements for enhanced household comparisons. The API offers building type, square meters, construction year, and energy characteristics - all critical for accurate electricity consumption benchmarking.

**Feasibility Rating: ✅ HIGH** - All required data points are available through the BBR API.

## Project Requirements vs. BBR API Capabilities

### Required Data Points (from FR-07B)

| **Requirement** | **BBR API Capability** | **Status** | **Implementation Notes** |
|---|---|---|---|
| Building type (house vs. apartment) | ✅ Available via `bygning` endpoint | **AVAILABLE** | Direct mapping from BBR building classification |
| Square meters (floor area) | ✅ Available via `bygning` endpoint | **AVAILABLE** | Multiple area measurements available |
| Construction year | ✅ Available via `bygning` endpoint | **AVAILABLE** | For energy efficiency estimates |
| Address-based lookup | ✅ Available via `ejendomsrelation` endpoint | **AVAILABLE** | Links addresses to building data |
| Privacy/anonymization support | ✅ Supported | **AVAILABLE** | Can hash building identifiers |

### Enhanced Capabilities (Bonus)

| **Additional Data** | **BBR API Capability** | **Value for MVP** |
|---|---|---|
| Energy installations | ✅ `tekniskanlaeg` endpoint | Enhanced heat pump/EV consumption profiles |
| Building materials | ✅ Available | Better insulation/efficiency estimates |
| Water/drainage systems | ✅ Available | Additional household profiling |
| Usage classification | ✅ Available | Residential vs. mixed-use filtering |

## Technical Implementation Overview

### API Architecture
- **Service Type:** REST Webservice
- **Base URL:** `https://services.datafordeler.dk/BBR/BBRPublic/1/REST/`
- **Data Formats:** JSON/XML
- **Version:** 1.0 (Stable)

### Available Endpoints

#### Core Endpoints for elregninger.dk

1. **`bygning` (Building Data)**
   - **Purpose:** Primary endpoint for building characteristics
   - **Data:** Square meters, construction year, building type, energy data
   - **Implementation:** Core endpoint for consumption profiling

2. **`ejendomsrelation` (Property Relations)**
   - **Purpose:** Links addresses to building data
   - **Data:** Address-to-building mapping
   - **Implementation:** First step in address lookup flow

3. **`enhed` (Units)**
   - **Purpose:** Individual unit/apartment data within buildings
   - **Data:** Unit-specific area and characteristics
   - **Implementation:** For apartment-specific comparisons

4. **`tekniskanlaeg` (Technical Installations)**
   - **Purpose:** Heating, cooling, and energy systems
   - **Data:** Heat pumps, solar panels, heating types
   - **Implementation:** Enhanced profiling for energy-intensive households

### Authentication & Access

#### Authentication Requirements
- **Web User Account:** Required for portal access
- **Service User Account:** Required for API access
- **Dual authentication system:** Both accounts needed for development

#### Authentication Methods
- Username/password (basic)
- API key authentication
- OAuth support available
- MitID Erhverv (enterprise authentication)

#### Access Process
1. Register web user account
2. Create service user account
3. Request API access permissions
4. Obtain API credentials
5. Test API connectivity

### Implementation Architecture

#### Recommended Data Flow Options

**Option A: BBR-Only Approach (Recommended for MVP)**
```
User Address Input → BBR ejendomsrelation API → Building ID
↓
BBR bygning API → Building Characteristics
↓
Privacy Hash → Anonymized Building Profile
↓
Enhanced Consumption Comparison
```

**Option B: Hybrid Approach (If BBR autocomplete is limited)**
```
User Address Input → Google Places API → Danish Address
↓
BBR ejendomsrelation API → Building ID
↓
BBR bygning API → Building Characteristics
↓
Privacy Hash → Anonymized Building Profile
↓
Enhanced Consumption Comparison
```

#### Integration Points with elregninger.dk

1. **Address Autocomplete Integration:**
   ```typescript
   // Option A: Direct BBR integration (preferred)
   const bbrData = await fetchBuildingDataFromAddress(userAddress);
   
   // Option B: Google Places fallback if needed
   // const standardizedAddress = await googlePlaces(userAddress);
   // const bbrData = await fetchBuildingData(standardizedAddress);
   ```

2. **Building Data Enrichment:**
   ```typescript
   interface BBRBuildingData {
     buildingType: 'house' | 'apartment' | 'townhouse';
     squareMeters: number;
     constructionYear: number;
     energyInstallations: string[];
   }
   ```

3. **Privacy-Safe Hashing:**
   ```typescript
   const anonymizedId = hashBuildingId(bbrBuildingId);
   // Store only hashed identifier for comparisons
   ```

## Specific Implementation Requirements

### API Integration Tasks

#### Phase 1: Basic Integration (MVP Required)
- [ ] **Account Setup:** Register both web and service users
- [ ] **API Access:** Request BBR API permissions 
- [ ] **Authentication:** Implement secure credential management
- [ ] **Address Lookup:** Connect Danish address to building ID
- [ ] **Building Data Fetch:** Retrieve basic building characteristics
- [ ] **Data Parsing:** Extract required fields (type, size, year)
- [ ] **Privacy Implementation:** Hash building identifiers
- [ ] **Error Handling:** Graceful fallbacks when data unavailable

#### Phase 2: Enhanced Features (Post-MVP)
- [ ] **Technical Installations:** Integrate heating/cooling system data
- [ ] **Unit-Level Data:** Support apartment-specific comparisons
- [ ] **Energy Efficiency:** Use construction year for efficiency estimates
- [ ] **Cache Strategy:** Implement building data caching
- [ ] **Performance Optimization:** Batch API requests

### Data Schema Integration

#### Required Database Schema
```sql
CREATE TABLE building_profiles (
  id UUID PRIMARY KEY,
  hashed_building_id VARCHAR(64) UNIQUE, -- Privacy hash
  building_type ENUM('house', 'apartment', 'townhouse'),
  square_meters INTEGER,
  construction_year INTEGER,
  has_heat_pump BOOLEAN,
  energy_class VARCHAR(2), -- A, B, C, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API Response Mapping
```typescript
// BBR API response transformation
const transformBBRData = (bbrResponse: BBRResponse): BuildingProfile => ({
  buildingType: mapBBRBuildingType(bbrResponse.bygningstype),
  squareMeters: bbrResponse.samletBygningsareal,
  constructionYear: bbrResponse.byggeaar,
  energyInstallations: bbrResponse.tekniskeAnlaeg || []
});
```

## Technical Challenges & Solutions

### Challenge 1: API Access Complexity
**Issue:** Two-tier authentication system  
**Solution:** Implement secure credential management in Next.js environment variables  
**Timeline:** 1-2 days setup

### Challenge 2: Address Autocomplete Decision
**Issue:** Unknown if BBR provides sufficient address autocomplete functionality  
**Solution:** Test BBR address lookup capabilities first; fallback to Google Places API if needed  
**Timeline:** 1 day testing, 1 day implementation

### Challenge 3: Data Completeness
**Issue:** Not all buildings may have complete data  
**Solution:** Implement tiered fallback system similar to AI extraction tiers  
**Timeline:** 1 day implementation

### Challenge 4: Privacy Compliance
**Issue:** BBR contains sensitive property data  
**Solution:** Hash all building identifiers, store only aggregated profiles  
**Timeline:** 1 day privacy implementation

### Challenge 5: Rate Limiting
**Issue:** API may have usage limits  
**Solution:** Implement caching strategy and batch requests  
**Timeline:** 1-2 days optimization

## Integration Timeline

### Week 1: Foundation (MVP Blocking)
- Day 1-2: Account setup and API access
- Day 3: Test BBR address autocomplete capabilities
- Day 4: Basic integration and authentication
- Day 5: Address-to-building lookup implementation (BBR-only or hybrid approach)

### Week 2: Core Features (MVP Required)
- Day 1-2: Building data retrieval and parsing
- Day 3: Privacy hashing implementation
- Day 4-5: Error handling and fallbacks

### Week 3: Enhancement (Post-MVP)
- Day 1-2: Technical installations integration
- Day 3-4: Performance optimization
- Day 5: Testing and validation

## Cost & Pricing Analysis

### BBR API Pricing
- **Access Model:** To be confirmed during registration
- **Expected Structure:** Usage-based or subscription model
- **Budget Consideration:** Factor into MVP operational costs

### Alternative Approaches
1. **BBR-Only Implementation:** Use BBR for both address lookup and building data
2. **Static Building Database:** Pre-download common building types
3. **Third-party Services:** Consider alternative building data providers
4. **Manual Input Fallback:** User-provided building details as backup

## Recommendations

### For MVP Development

#### ✅ Proceed with BBR Integration
**Reasoning:**
- All required data points available
- Aligns perfectly with project requirements
- Enhances accuracy of consumption comparisons
- Supports privacy-by-design architecture

#### Implementation Priority
1. **High Priority:** Basic building lookup (type, size, year)
2. **Medium Priority:** Technical installations data
3. **Low Priority:** Advanced energy efficiency calculations

#### Risk Mitigation
1. **Fallback Strategy:** Manual input form if BBR unavailable
2. **Gradual Rollout:** Start with basic data, enhance over time
3. **Error Monitoring:** Track API availability and data completeness

### Technical Architecture Recommendations

#### Caching Strategy
```typescript
// Vercel KV cache for building data
const cacheKey = `bbr:${hashedAddress}`;
const cachedData = await kv.get(cacheKey);
if (!cachedData) {
  const bbrData = await fetchBBRData(address);
  await kv.set(cacheKey, bbrData, { ex: 86400 }); // 24h cache
}
```

#### Error Handling Pattern
```typescript
try {
  const buildingData = await getBBRData(address);
  return enhancedComparison(buildingData);
} catch (error) {
  // Graceful fallback to manual inputs
  return basicComparison(manualInputs);
}
```

## Next Steps

### Immediate Actions (Next 2-3 Days)
1. **Account Registration:** Set up BBR API access accounts
2. **Documentation Review:** Access full Confluence documentation
3. **Address Autocomplete Testing:** Evaluate BBR's address search/autocomplete capabilities
4. **Test Environment:** Set up development API testing
5. **Integration Planning:** Finalize BBR-only vs. hybrid approach based on address testing

### Integration Development (Following Week)
1. **Authentication Setup:** Implement secure API access
2. **Basic Integration:** Address lookup and building data retrieval
3. **Privacy Implementation:** Building identifier hashing
4. **Testing:** Validate against diverse Danish addresses

## Conclusion

The BBR API integration is **highly feasible** and **strongly recommended** for the elregninger.dk MVP. The API provides all required building data with excellent coverage of Danish properties. The two-phase implementation approach balances MVP requirements with future enhancement opportunities.

**Key Success Factors:**
- Proper account setup and API access
- Robust error handling and fallback systems
- Privacy-compliant data hashing
- Effective caching strategy

**Expected Impact:**
- Significantly improved consumption comparison accuracy
- Enhanced user trust through building-specific benchmarks
- Competitive advantage over generic consumption estimates
- Foundation for advanced energy efficiency features
- Potential cost savings by avoiding Google Maps API dependency

**Address Integration Recommendation:**
Test BBR's address autocomplete capabilities first. If BBR provides adequate address search functionality for Danish properties, implement a BBR-only solution to:
- Reduce API dependencies and costs
- Keep all data within Danish government systems (enhanced privacy trust)
- Simplify integration complexity
- Align with privacy-conscious user expectations

The BBR API integration supports elregninger.dk's goal of becoming Denmark's most trusted utility bill analysis tool by providing precise, building-specific consumption comparisons that users can trust.