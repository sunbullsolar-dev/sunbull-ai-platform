# Sunbull AI Frontend - Complete File Manifest

## Configuration Files (5)
- `package.json` - Dependencies & scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS with custom colors & fonts
- `tsconfig.json` - TypeScript configuration with @ alias
- `postcss.config.js` - PostCSS with Tailwind & autoprefixer

## Global Styles & Layout (3)
- `src/app/globals.css` - Tailwind imports, CSS vars, dark theme base styles, animations
- `src/app/layout.tsx` - Root layout with Google Fonts, metadata, dark bg
- `src/app/page.tsx` - Homepage with hero, stats, how-it-works, testimonials, trust blocks

## Intake Form Pages (2)
- `src/app/get-quote/page.tsx` - 6-field form (name, email, phone, address, utility, bill amount)
- `src/app/get-quote/processing/page.tsx` - Progress bar with step-by-step status messages

## Proposal & Checkout (3)
- `src/app/proposal/[id]/page.tsx` - Full proposal page (hero numbers, comparison, payments, trust)
- `src/app/checkout/[proposalId]/page.tsx` - Multi-step checkout flow with progress indicator
- `src/app/dashboard/[dealId]/page.tsx` - Customer dashboard with pipeline tracker

## UI Components (7)
- `src/components/ui/Button.tsx` - Primary, secondary, ghost variants with loading spinner
- `src/components/ui/Card.tsx` - Dark surface card with border & hover effects
- `src/components/ui/Input.tsx` - Form input with label, sublabel, error state
- `src/components/ui/Select.tsx` - Dropdown select with dark theme
- `src/components/ui/Badge.tsx` - Status badges (default, success, warning, error, info)
- `src/components/ui/ProgressBar.tsx` - Animated progress bar with percentage label
- `src/components/ui/Modal.tsx` - Modal dialog with animations

## Layout Components (2)
- `src/components/layout/Header.tsx` - Sticky header with logo, nav links, mobile menu
- `src/components/layout/Footer.tsx` - Footer with links, legal notice, confidentiality

## Trust Components (6)
- `src/components/trust/InstallCounter.tsx` - Animated counter (1,500+ installs)
- `src/components/trust/NeighborhoodMap.tsx` - SVG-based installation heatmap
- `src/components/trust/FounderStory.tsx` - Abdo's founder story card
- `src/components/trust/InstallerCredentials.tsx` - Installer name, license, certs
- `src/components/trust/ReviewCarousel.tsx` - Auto-rotating customer reviews with nav
- `src/components/trust/DataTransparency.tsx` - Collapsible data sources panel

## Proposal Components (4)
- `src/components/proposal/HeroNumbers.tsx` - Big display of system stats
- `src/components/proposal/ComparisonChart.tsx` - 25-year utility vs solar recharts
- `src/components/proposal/PaymentOptionCards.tsx` - Lease, Finance, Cash cards with CTAs
- `src/components/proposal/TrustBlock.tsx` - Assembled trust components section

## Checkout Components (3)
- `src/components/checkout/CommitmentSummary.tsx` - Full summary before DocuSign
- `src/components/checkout/InspectionScheduler.tsx` - Calendar date/time picker
- `src/components/checkout/WelcomeScreen.tsx` - Post-sign congratulations screen

## Dashboard Components (1)
- `src/components/dashboard/PipelineTracker.tsx` - Visual pipeline with stages & dates

## API & Hooks (3)
- `src/lib/api.ts` - Axios client with typed request helpers
- `src/lib/hooks/useProposal.ts` - Hook to fetch & poll proposal status
- `src/lib/hooks/useDashboard.ts` - Hook for dashboard data with polling

## Documentation & Config (4)
- `README.md` - Comprehensive project documentation
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore rules
- `FILES.md` - This file (manifest)

## Total: 42 Files

### Code Statistics
- TypeScript/JSX: 28 files
- Config/Build: 5 files
- Styles: 1 file
- Documentation: 3 files
- Other: 5 files (node_modules excluded)

### Size: ~232 KB (excluding node_modules)
