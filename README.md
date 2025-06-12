# Elregninger.dk - Danish Electricity Bill Analysis MVP

> Danish electricity bill analysis web application using AI to provide transparent insights with household comparisons.

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/transportrefer/elregninger-dk.git
   cd elregninger-dk
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Add your API keys to .env.local
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Visit http://localhost:3000

## 🔧 Tech Stack

- **Frontend:** Next.js 14+ with App Router, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components  
- **AI:** Google Gemini Flash API (multimodal)
- **Validation:** Zod schemas
- **Hosting:** Vercel (via GitHub deployment)

## 📋 Environment Variables

```bash
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_maps_api_key_here
BBR_API_KEY=your_bbr_api_key_here
MAILERLITE_API_KEY=your_mailerlite_api_key_here
GA4_MEASUREMENT_ID=your_ga4_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🧪 Current Status: Technical Spike Validation

The technical spike is **validated and ready for broader testing**:

- ✅ Google Gemini API integration with robust error handling
- ✅ Zod schema validation with Danish number format support
- ✅ Tiered extraction validation (Critical/Important/Nice-to-have)
- ✅ Mobile-first test interface with Danish UI
- ✅ Privacy-conscious file handling and security
- ✅ **Vindstød bill test: 100% Tier 1+2 success rate**
- ✅ Comprehensive code review and improvements implemented
- ✅ Production deployment ready

**Current Phase:** Collecting diverse Danish bills for 80%+ validation target.

## 🔒 Privacy by Design

- Files processed in-memory only
- Immediate deletion after analysis
- No persistent storage of bill content
- GDPR-compliant data handling

## 📚 Documentation

- [`PRD.md`](./PRD.md) - Product Requirements Document
- [`MVP_TASKS.md`](./MVP_TASKS.md) - Comprehensive task breakdown
- [`CLAUDE.md`](./CLAUDE.md) - Development guidelines and config

## 🧪 Testing

```bash
npm run build       # Production build test
npm run lint        # ESLint check  
npm run typecheck   # TypeScript validation
npm run test:bills  # Validate Danish bills (requires test data)
```

### Bill Validation Testing
1. Add anonymized Danish electricity bills to `test-bills/pdf/` or `test-bills/images/`
2. Start development server: `npm run dev`
3. Run validation suite: `npm run test:bills`
4. Check results in `test-bills/results/`

**Target:** 80%+ success rate on Tier 1+2 extraction across diverse providers.

## 🚀 Deployment

Connected to Vercel via GitHub for automatic deployments:
- **Production:** [elregninger.dk](https://elregninger.dk)
- **Staging:** Auto-deployed from feature branches

---

**Target:** Become Denmark's most trusted utility bill analysis tool for financially literate, privacy-conscious users.
