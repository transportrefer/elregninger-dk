
# Product Requirements Document: elregninger.dk MVP

**Version:** 1.4 **Date:** 2025-06-12 **Status:** Approved for Development

### 1. Introduction & Vision

#### 1.1 Document Purpose

This document defines the requirements, features, and scope for the Minimum Viable Product (MVP) of the elregninger.dk web application. It is the single source of truth for the development team.

#### 1.2 Problem Statement

Danish electricity bills are complex and opaque, leaving consumers unsure of what they are paying for and whether they could be saving money. There is a lack of simple, trustworthy tools to quickly analyze a bill and get actionable insights.

#### 1.3 Product Vision

To become the most trusted and user-friendly tool in Denmark for analyzing utility bills, empowering consumers to understand their consumption and make smarter financial decisions. The long-term commercialization strategy is an affiliate model built upon a foundation of user trust, facilitated by a highly engaged email list.

### 2. Target Audience & Persona

#### 2.1 Primary Target Audience: The "Informed Danish Skeptic"

Our initial user is not the average consumer. We are specifically targeting a discerning user who embodies the following traits:

-   **Financially Literate:** They likely frequent communities like `/r/dkfinance`.
    
-   **Data-Driven & Skeptical:** They value transparency and data over marketing fluff. They will be the first to spot errors in the analysis.
    
-   **Trust-Oriented:** They will read the privacy policy. Building their trust is a core feature of the product. Our "no data selling" and "instant file deletion" policies are designed specifically for this persona.
    

### 3. MVP Goals & Success Metrics

The primary goal of the MVP is to validate the core value proposition (automated bill analysis) and build a targeted user base by earning the trust of our initial audience.

#### 3.1 Launch Success (First 30 Days)

-   **Primary Metric:** 1,000+ bills successfully analyzed.
    
-   **Secondary Metric:** 15%+ email capture rate from users who complete an analysis.
    
-   **Tertiary Metric:** Positive qualitative feedback and engagement on community forums (e.g., Reddit).
    
-   **Health Metric:** <5% error rate on bill processing, aided by user feedback (FR-11).
    

#### 3.2 Growth Validation (First 90 Days)

-   **Primary Metric:** 10,000+ bills analyzed.
    
-   **Secondary Metric:** Email capture rate trending towards 20%+.
    
-   **Tertiary Metric:** Measurable organic traffic growth.
    
-   **Business Metric:** Initial partnership discussions initiated based on proven user engagement.
    

### 4. User Journey & Core Flow

The user flow is designed to deliver value immediately, building trust before asking for anything in return:

1.  **Landing:** User arrives on a clean, single-purpose landing page.
    
2.  **Upload:** User uploads their electricity bill.
    
3.  **(Optional) Personalize:** User can opt to provide anonymous household data for a more detailed consumption comparison.
    
4.  **Analysis:** The system analyzes the bill in real-time.
    
5.  **Display Results:** The user is immediately shown a full, interactive breakdown of their bill and consumption benchmarks.
    
6.  **Feedback:** User is presented with a simple, optional feedback mechanism.
    
7.  **Optional CTA:** The user is presented with a compelling, optional call-to-action to sign up.
    

### 5. Feature Requirements (MVP)

**FR-01: Bill Upload**

-   **Description:** A standard file-picker interface for uploading bills, designed with a mobile-first, camera-first flow (see 7.4).
    
-   **Requirements:**
    
    -   Supports PDF, PNG, JPG formats (Max 10MB).
        
    -   Interface must prominently display the privacy promise: _"Din fil slettes straks efter analyse. Vi sælger aldrig dine data."_
        
    -   Includes an optional, clearly labeled section:
        
        -   Checkbox: `[ ] Sammenlign mit elforbrug med lignende husstande`.
            
        -   If checked, reveals smart address input with Google Maps API autocomplete and additional household inputs:
            
            -   Address field with Google Places autocomplete
            -   BBR API integration to automatically detect building type and size
            -   Manual inputs: Number of adults/children, EV (Yes/No), Heat Pump (Yes/No)
            

**FR-02: AI-Powered Analysis**

-   **Description:** The core feature where the system extracts and structures data from the uploaded bill using the Google Gemini API.
    
-   **Required JSON Output Schema:**
    
    ```
    {
      "providerName": "string",
      "productName": "string",
      "priceType": "fixed|variable|unknown",
      "isFinalSettlement": boolean,
      "isGreenEnergy": boolean,
      "consumptionPeriod": {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD"
      },
      "totalConsumption_kWh": number,
      "costBreakdown_DKK": {
        "pureElectricity": number,
        "transportAndGrid": number,
        "stateTaxes": number,
        "elafgift": number,
        "psoAfgift": number,
        "providerSubscriptions": number,
        "oneOffFees": number,
        "vat": number
      },
      "totalAmountForConsumption_DKK": number,
      "averagePrice_kr_per_kWh": number,
      "pricePeriods": [{
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "pricePerKwh": number
      }],
      "notes": "string"
    }
    
    ```
    
-   **Testing & Iteration Protocol:**
    
    -   A test script will run the AI prompt against a catalog of 50+ real bills.
        
    -   The prompt will be refined based on inaccuracies identified in testing and via the User Feedback Mechanism (FR-11).
        
-   **Error Handling Protocol:**
    
    1.  **Successful Extraction Tiers:**
        
        -   **Tier 1 (Critical):**  `totalConsumption_kWh`, `totalAmountForConsumption_DKK`
            
        -   **Tier 2 (Important):**  `providerName`, `costBreakdown_DKK`, `consumptionPeriod`
            
        -   **Tier 3 (Nice-to-have):**  `priceType`, `isGreenEnergy`, `pricePeriods`
            
    2.  **Response Based on Extraction Success:**
        
        -   **All Tiers Extracted:** Full analysis display.
            
        -   **Tier 1+2 Only:** Show analysis with a note: _"Nogle detaljer, såsom pristype, kunne ikke udtrækkes fra regningen."_
            
        -   **Tier 1 Only:** Show a basic analysis (total cost and consumption) with a clear warning banner: _"Vi kunne kun læse de overordnede tal. For en fuld analyse, prøv venligst med et tydeligere billede eller en PDF-fil."_
            
        -   **No Tier 1:** Show a specific error message (see below) instead of the results page.
            
    3.  **Field-Level Error Display:**
        
        -   Missing fields in a partially successful analysis will display a placeholder: "—" with a tooltip explaining _"Denne værdi kunne ikke læses fra regningen."_
            
    4.  **Specific Error Messages for Total Failure:**
        
        -   **Poor image quality:**  _"Billedet er sløret. Prøv venligst at tage et nyt billede i bedre lys."_
            
        -   **Unsupported format:**  _"Vi kunne ikke genkende denne regningstype. Er du sikker på, at det er en elregning (og ikke en aconto-regning)?"_
            

**FR-03: Results Display**

-   **Description:** The user-facing presentation of the bill analysis, designed to be fully responsive (see 7.4).
    
-   **Requirements:**
    
    -   Must display a primary summary, an interactive pie chart for the cost breakdown, and a "traffic light" price indicator.
        
    -   **Bell curve visualization** showing user's consumption position relative to similar households (low/median/high consumption) with clear visual indicator of their position on the distribution curve.
        
    -   If user provided household data (FR-01), display a personalized comparison.
        
    -   Frontend built using the shadcn/ui component library.
        
    -   **Include social sharing buttons** below the results with pre-filled, privacy-conscious messages:
        
        -   **Facebook:** "Jeg har lige analyseret min elregning på elregninger.dk - super nemt at se, hvad jeg betaler for!"
            
        -   **LinkedIn:** "Anbefalelsesværdigt værktøj til at forstå danske elregninger 📊"
            
        -   **Reddit (for /r/dkfinance):** "Fandt dette værktøj til at analysere elregninger - ingen login krævet."
            
        -   Buttons must NOT share any personal data, consumption figures, or analysis results.
            
        -   Track shares as conversion events in GA4.
            

**FR-04: Optional Email Capture**

-   **Description:** A feature to allow users to join a mailing list.
    
-   **Requirements:**
    
    -   CTA appears only after users receive full analysis value.
        
    -   **Incentive:**  _"Download denne analyse som PDF og få besked om nye sparetips og når det er tid til at skifte elselskab for at undgå at miste din intro-rabat."_
        
    -   Integrate with MailerLite for the MVP.
        

**FR-05: Aconto Bill Handling**

-   **Description:** Graceful failure for unsupported bill types.
    
-   **Requirements:**
    
    -   Detect aconto-only bills.
        
    -   Show Danish error: _"Fejl: Kunne ikke analysere filen. Det ser ud til, at dette er en aconto-regning. Upload venligst din seneste opgørelse eller slutafregning for at få en fuld analyse."_
        

**FR-06: Privacy & Data Handling**

-   **Description:** Foundational principles for user data management.
    
-   **Requirements:**
    
    -   Uploaded files deleted from memory/temporary storage immediately after analysis.
        
    -   Anonymized JSON output is only sent to a secure logging service for engineering review if a user explicitly flags an analysis as incorrect (see FR-11).
        

**FR-07: Benchmark Data for Price & Consumption Comparison**

-   **Description:** Integration of external data to provide market comparison.
    
-   **Requirements:**
    
    -   Fetch average market _prices_ via Energi Data Service API. Update daily.
        
    -   Use granular, publicly available household _consumption_ estimates from sources like Energinet to create baseline profiles based on household size, EV, and heat pump status.
        
    -   Apply a monthly multiplier to consumption profiles to account for seasonality.
        
    -   Fallback: Use static local averages when an API is unavailable, with a clear flag.

**FR-07B: Enhanced Address-Based Household Data**

-   **Description:** Smart address input system for more accurate household profiling using Danish building registry data.
    
-   **Requirements:**
    
    -   Integrate Google Maps Places API for Danish address autocomplete with proper error handling.
        
    -   Connect to BBR API (Bygnings- og Boligregistret) to automatically retrieve:
        
        -   Building type (house vs. apartment)
        -   Square meters (floor area)
        -   Construction year (for energy efficiency estimates)
        
    -   Enhance consumption comparison accuracy using building-specific data rather than manual inputs.
        
    -   Fallback to manual inputs if APIs are unavailable or return insufficient data.
        
    -   Address data privacy: Hash and anonymize building identifiers for comparison purposes only.
        

**FR-08: Foundational SEO**

-   **Description:** Technical and on-page SEO best practices.
    
-   **Requirements:**
    
    -   Metadata: Dynamic `<title>` and `<meta name="description">` tags.
        
    -   Semantic HTML: Proper structure (`<h1>`, `<main>`, `<nav>`).
        
    -   Crawlability: `robots.txt` and auto-generated `sitemap.xml`.
        
    -   Performance: Adhere to Core Web Vitals using Next.js optimizations.
        

**FR-09: Cookie Consent & Analytics**

-   **Description:** Implement user consent mechanisms in line with GDPR.
    
-   **Requirements:**
    
    -   Deploy a cookie consent banner before any tracking scripts are activated.
        
    -   Google Analytics 4 (GA4) settings must have IP anonymization enabled.
        
    -   GTM and Microsoft Clarity integrations must respect user consent choices.
        

**FR-10: Source Transparency**

-   **Description:** Display the sources for all external data to build trust.
    
-   **Requirements:**
    
    -   The results page must include a small, clearly labeled section at the bottom of the page, styled like sources in a blog post, citing the data sources (e.g., "Prisdata fra Energi Data Service," "Forbrugsestimater baseret på data fra Energinet").
        

**FR-11: User Feedback Mechanism**

-   **Description:** A simple, non-intrusive feedback tool on the results page to capture analysis accuracy and accelerate AI improvements.
    
-   **Requirements:**
    
    -   After the results are displayed, show a simple question: _"Var denne analyse korrekt?"_ with "Ja" / "Nej" buttons.
        
    -   A "Nej" click sends the anonymized JSON output to a secure, internal logging endpoint for engineering review. No other user data is sent.
        
    -   The privacy policy must clearly explain this process.
        

### 6. Out of Scope for MVP

-   Active off-page SEO or link-building campaigns.
    
-   User accounts and historical bill tracking.
    
-   Support for other utility types (water, heating).
    

### 7. Technical Stack & Architecture

#### 7.1 Technology Stack

-   **Frontend:** Next.js 14+ with App Router
    
-   **Styling:** Tailwind CSS with shadcn/ui components
    
-   **AI/ML:** Google Gemini Flash API (multimodal)
    
-   **Email Service:** MailerLite
    
-   **Analytics:** Google Analytics 4, Google Tag Manager, Microsoft Clarity
    
-   **Hosting:** Vercel
    
-   **External APIs:** Energi Data Service API, Google Maps Places API, BBR API (Danish Building Registry)
    

#### 7.2 Data Flow

User uploads bill → Frontend → Next.js API route → Gemini API → JSON → Add benchmark data → Delete file → Frontend displays results
Optional: User enters address → Google Places API → BBR API → Building data → Enhanced household comparison

#### 7.3 Security & Privacy

-   **No Persistent Storage:** Files deleted post-processing.
    
-   **HTTPS Only:** All communications encrypted.
    
-   **GDPR Compliant:** Data minimization; clear cookie and email consent.
    

#### 7.4 Design Principles

-   **Mobile-First Approach:** The user interface will be designed for a 375px width viewport first, then scaled up to ensure a seamless experience on all devices.
    
-   **Touch-Optimized UI:** Interactive elements will be designed for touch. Upload buttons will have a minimum 44x44px tap target. Feedback buttons (`Ja`/`Nej`) and other controls will have at least 8px of space between them.
    
-   **Camera-First Upload Flow:** On mobile devices, the interface will prioritize camera capture (`<input type="file" capture="environment">`) over file system selection. The flow may include client-side checks for image quality or sharpness.
    
-   **Responsive Results Display:** The analysis presentation must adapt gracefully to mobile screens. The pie chart will scale to fit the viewport, and data tables (like cost breakdown) will use horizontal scrolling or be re-formatted into cards to prevent layout breakage.
    

### 8. Risks & Mitigation

Risk Category

Risk Description

Mitigation Plan

**Technical**

Gemini API accuracy is insufficient across varied layouts.

Use the Testing & Iteration Protocol on 50+ real bills; refine prompt; leverage user feedback (FR-11).

**Technical**

Energi Data Service API is unavailable.

Fallback to static averages (FR-07); monitor API status.

**Business**

Email conversion below 15% target.

A/B test alternative value propositions (alerts-only, different incentives).

**Business**

Competitors copy core feature quickly.

Move fast; build trust; cultivate community around the "Informed Skeptic" persona as a moat.

### Appendix A: Key Decisions & Rationale

-   **Decision:** Show results before asking for email.
    
    -   **Rationale:** Builds trust by delivering value upfront, which is critical for our target persona.
        
-   **Decision:** Defer real-time provider switching/affiliate links.
    
    -   **Rationale:** De-risks MVP; allows focus on core analysis and building the email list asset first.
        
-   **Decision:** Use MailerLite for MVP.
    
    -   **Rationale:** Fast and simple to implement; can migrate later as needs evolve.
        

### Appendix B: Long-Term Vision

The ultimate goal is to evolve beyond simple analysis into a personalized, automated savings service. The core asset developed from the MVP is the targeted email list of engaged, financially literate users.

### Appendix C: Future Features Radar

A list of features and ideas considered valuable but explicitly deferred past the MVP. This list serves as a backlog for future planning.

-   **Full User Accounts:** Move beyond the anonymous, one-off analysis by allowing users to create accounts. This enables tracking of savings over time, provides the foundation for personalized alerts, increases user retention, and is the key prerequisite for the proactive affiliate model.
    
-   **Proactive Affiliate Switching:** The core of the long-term business model. Users with accounts can store their current provider and contract end-date. The system will then send timely, personalized alerts with direct affiliate links to new, better-value introductory offers, creating a frictionless switching experience that maximizes user savings.
    
-   **Public Data Insights & Community Benchmarks:** With explicit user opt-in and ironclad anonymization, aggregate data to create public-facing reports and interactive dashboards on the website. This could include insights like "Most popular providers among our users," "Average kr/kWh price in Q3," or "Consumption trends for households with heat pumps." This feature reinforces our brand as a data-driven authority, generates valuable content for SEO, and allows users to benchmark themselves against a real, relevant community.
    
-   **Expanded Utility Support:** Broaden the application's appeal and market size by adding support for analyzing other common Danish utility bills, such as water and heating. This positions the service as a single hub for all household utility management, deepening the user relationship.
    
-   **Deeper Provider Insights:** Move beyond generic market averages to answer specific questions like, "Is my provider's 'green' energy plan actually more expensive than their standard one?" or "How do my provider's network fees compare to others in my area?" This enhances the tool's value for sophisticated users and builds our authority.
    
-   **Advanced Trend Analysis:** Leverage historical data from user accounts to visualize consumption patterns over months or years. This will help users understand the financial impact of lifestyle changes (e.g., buying an EV, improving home insulation) and identify opportunities for long-term energy efficiency improvements.