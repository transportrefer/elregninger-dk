# Claude Configuration for Elregninger.dk

## Project Overview
Danish electricity bill analysis web application MVP. Core value: analyze uploaded bills using AI and provide transparent insights with household comparisons.

## Tech Stack
- **Frontend:** Next.js 14+ with App Router, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components  
- **AI:** Google Gemini Flash API (multimodal) - credentials available
- **Address/Building:** Google Maps Places API + BBR API (Danish Building Registry)
- **Email:** MailerLite integration
- **Data Cache:** Vercel KV for Energi Data Service caching
- **Hosting:** Vercel via GitHub deployment
- **Domain:** elregninger.dk (already registered)
- **Analytics:** GA4, GTM, Microsoft Clarity (privacy-focused)

## Key Development Guidelines

### Development Priority (CRITICAL)
- **WEEK 1 MANDATORY:** Technical spike to validate Gemini AI extraction (80%+ success rate required)
- Start with minimal Next.js + single API route + Zod validation
- Test against 10-15 diverse Danish bills before building UI
- **GATE:** Only proceed with full development if spike succeeds

### Code Standards
- Mobile-first responsive design (375px viewport first)
- Touch-optimized UI (44x44px minimum tap targets)
- Danish language for all user-facing text
- Privacy-by-design throughout
- In-memory processing (avoid /tmp when possible)
- Client-side image compression before upload
- No comments in code unless specifically requested

### Enhanced Privacy Rules
- **Files processed in-memory:** Avoid writing to persistent storage
- **Immediate deletion:** Cleanup in finally blocks
- **No PII logging:** Strict policy against logging sensitive data
- **Trust documentation:** Create detailed security explanation page
- **Address anonymization:** Hash building identifiers
- **Social sharing safety:** Generate clean OG images with @vercel/og

### Target Audience: "Informed Danish Skeptic"
- Financially literate (/r/dkfinance community)
- Data-driven and skeptical of marketing
- Will read privacy policies
- Values transparency over convenience

## Project Structure
```
/
├── PRD.md              # Product requirements (v1.4)
├── MVP_TASKS.md        # Comprehensive task breakdown
├── CLAUDE.md          # This file
└── src/               # Next.js app structure
```

## Key Features Priority
1. **Technical Spike** - Validate AI extraction pipeline first
2. **Bill Upload** - Camera-first mobile flow with image compression
3. **AI Analysis** - Gemini API with few-shot prompts, Zod validation, tiered extraction
4. **Address Integration** - Google Places + BBR API for smart household profiling
5. **Results Display** - Pie charts, traffic light pricing, bell curve visualization, user feedback system
6. **Email Capture** - MailerLite integration after analysis
7. **Enhanced Privacy** - In-memory processing, trust documentation

## Testing Requirements
- Test against 50+ real Danish electricity bills
- Mobile device testing mandatory
- Cross-browser compatibility
- Accessibility compliance (WCAG)
- Always run lint/typecheck before commits

## Danish Text Requirements
All user-facing text must be in Danish:
- Privacy message: "Din fil slettes straks efter analyse. Vi sælger aldrig dine data."
- Comparison checkbox: "Sammenlign mit elforbrug med lignende husstande"
- Error messages in Danish (see PRD for examples)

## Environment Variables Needed
```
GOOGLE_GEMINI_API_KEY=
GOOGLE_MAPS_API_KEY=
BBR_API_KEY=
MAILERLITE_API_KEY=
GA4_MEASUREMENT_ID=
NEXT_PUBLIC_BASE_URL=
VERCEL_KV_URL=
VERCEL_KV_REST_API_URL=
VERCEL_KV_REST_API_TOKEN=
```

## Development Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run typecheck` - TypeScript validation

## Success Metrics (MVP)
- 1,000+ bills analyzed (first 30 days)
- 15%+ email capture rate
- <5% error rate on bill processing
- Positive /r/dkfinance community feedback

## Critical Notes
- **TECHNICAL SPIKE FIRST:** Validate AI extraction before UI development
- Never store personal data or bill contents (in-memory processing only)
- All benchmark data citations required with transparent sourcing
- Mobile camera capture prioritized with image compression
- Address data must be hashed and anonymized
- Social sharing must be privacy-conscious (generate clean OG images)
- User feedback system for AI improvement ("Er dette korrekt?")
- Vercel Cron Jobs for daily Energi Data Service caching
- BBR API integration for accurate building data
- Enhanced trust documentation for skeptical users