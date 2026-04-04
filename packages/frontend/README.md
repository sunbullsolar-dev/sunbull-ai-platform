# Sunbull AI Frontend

Complete Next.js 14 homeowner-facing website for the Sunbull AI solar sales platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── page.tsx                  # Homepage with hero, how-it-works, testimonials
│   │   ├── layout.tsx                # Root layout with fonts, metadata
│   │   ├── globals.css               # Global styles, Tailwind imports, CSS vars
│   │   ├── get-quote/
│   │   │   ├── page.tsx              # Intake form (6 fields + validation)
│   │   │   └── processing/
│   │   │       └── page.tsx          # Processing screen with progress bar
│   │   ├── proposal/[id]/
│   │   │   └── page.tsx              # Full proposal page (hero, comparison, payments, trust)
│   │   ├── checkout/[proposalId]/
│   │   │   └── page.tsx              # Multi-step checkout flow
│   │   └── dashboard/[dealId]/
│   │       └── page.tsx              # Post-sale progress tracker
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx            # Primary, secondary, ghost variants
│   │   │   ├── Card.tsx              # Dark surface card with hover effects
│   │   │   ├── Input.tsx             # Form input with label & error
│   │   │   ├── Select.tsx            # Dropdown with dark theme
│   │   │   ├── Badge.tsx             # Status badges (colored)
│   │   │   ├── ProgressBar.tsx       # Animated progress indicator
│   │   │   └── Modal.tsx             # Dialog with animations
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Sticky header with logo & nav
│   │   │   └── Footer.tsx            # Footer with links & legal
│   │   │
│   │   ├── trust/                    # Trust/social proof components
│   │   │   ├── InstallCounter.tsx    # "1,500+ installs" animated counter
│   │   │   ├── NeighborhoodMap.tsx   # SVG-based installation heatmap
│   │   │   ├── FounderStory.tsx      # Abdo's 3-sentence story
│   │   │   ├── InstallerCredentials.tsx  # Installer name, license, certs
│   │   │   ├── ReviewCarousel.tsx    # Auto-rotating customer reviews
│   │   │   └── DataTransparency.tsx  # Collapsible data sources panel
│   │   │
│   │   ├── proposal/
│   │   │   ├── HeroNumbers.tsx       # Big stats: panels, kW, offset%, bill
│   │   │   ├── ComparisonChart.tsx   # 25-year utility vs solar recharts
│   │   │   ├── PaymentOptionCards.tsx # Lease, finance, cash cards
│   │   │   └── TrustBlock.tsx        # Assembled trust components
│   │   │
│   │   └── checkout/
│   │       ├── CommitmentSummary.tsx # Summary before signing
│   │       ├── InspectionScheduler.tsx # Calendar date/time picker
│   │       └── WelcomeScreen.tsx     # Post-sign congratulations
│   │
│   └── lib/
│       ├── api.ts                    # Axios client with interceptors
│       └── hooks/
│           ├── useProposal.ts        # Hook to fetch & poll proposal status
│           └── useDashboard.ts       # Hook for customer dashboard data
│
├── public/                           # Static assets
├── package.json                      # Dependencies (Next.js 14, React 18, Tailwind, etc.)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind with custom colors & fonts
├── tsconfig.json                     # TypeScript config with @ path alias
├── postcss.config.js                 # PostCSS with Tailwind & autoprefixer
├── .env.example                      # Environment variable template
└── .gitignore
```

## Key Features

### Design System
- **Dark Theme**: #0F0F0F background with #111111/#181818 surfaces
- **Accent Color**: Amber/Gold (#F59E0B) for primary CTAs
- **Fonts**:
  - Bebas Neue for headlines (tracking-widest)
  - DM Sans for body text
  - DM Mono for code/data displays
- **Animations**: Framer Motion for smooth transitions

### Pages

#### 1. Homepage (`/`)
- Hero section with animated stats
- How It Works (4-step process)
- Customer testimonials carousel
- Why Sunbull trust blocks
- Multiple CTAs to intake form

#### 2. Intake Form (`/get-quote`)
- 6-field form:
  - Full Name (with title sublabel)
  - Email & Mobile Phone
  - Property Address
  - State dropdown → Utility Provider dropdown
  - Monthly Bill Amount ($ or kWh toggle)
  - Optional utility bill upload (drag & drop)
- TCPA consent checkbox (unchecked by default)
- React Hook Form + Zod validation
- On submit: POST to `/api/v1/leads`, redirect to processing page

#### 3. Processing Page (`/get-quote/processing`)
- Animated progress bar (0-100%)
- Step-by-step status messages:
  - "Analyzing your roof..."
  - "Pulling utility rates..."
  - "Calculating your savings..."
  - "Building your proposal..."
- Polls `/api/v1/proposals/{id}/status` every 1 second
- Auto-redirects to proposal on completion

#### 4. Proposal Page (`/proposal/[id]`)
- **Hero Numbers**: [Name]'s Solar Proposal with panels, kW, offset%, monthly bill
- **25-Year Comparison**: Recharts bar chart showing utility vs solar costs
- **Three Payment Options**: Lease, Finance (highlighted), Cash with CTAs
- **Data Transparency**: Collapsible "How were these numbers calculated?"
- **Trust Block**: Install counter, installer creds, founder story, reviews, map
- All sections animate on scroll

#### 5. Checkout (`/checkout/[proposalId]`)
- Multi-step flow with progress indicator:
  - Step 1: Commitment Summary
  - Step 2: DocuSign signing (iframe placeholder)
  - Step 3: Inspection Scheduler (calendar + time picker)
  - Step 4: Welcome Screen (congratulations)
- Animated step transitions

#### 6. Customer Dashboard (`/dashboard/[dealId]`)
- Contact info card (email, phone, address)
- System details (kW, panel count, monthly payment)
- Payment info summary
- **Pipeline Tracker**:
  - Timeline visualization: Contract → Inspection → Permit → Install → Final Inspection → PTO → System Live
  - Current stage highlighted in amber
  - Each stage shows expected & actual dates
- Support contact section

## UI Components

All components are fully styled with Tailwind and support dark theme:

- **Button**: Primary (amber), secondary (outline), ghost variants with loading spinner
- **Card**: Dark surface with border, hover effects
- **Input**: Label, sublabel, error state
- **Select**: Dropdown with icon
- **Badge**: Colored variants (success, warning, error, info)
- **ProgressBar**: Animated with percentage label
- **Modal**: Animated with backdrop, close button

## API Client

Located at `src/lib/api.ts`. Provides typed methods:

```typescript
// Leads
apiClient.createLead({...})

// Proposals
apiClient.getProposal(id)
apiClient.checkProposalStatus(id)

// Checkout
apiClient.selectPaymentOption(id, optionId)
apiClient.scheduleInspection(dealId, date, time)

// Dashboard
apiClient.getDeal(id)
apiClient.getDealTimeline(id)

// Auth (magic link)
apiClient.requestMagicLink(email)
apiClient.verifyMagicLink(token)
```

## Custom Hooks

### `useProposal(proposalId)`
Fetches and polls proposal generation status. Auto-redirects to proposal when ready.

```typescript
const { proposal, loading, error, checkStatus } = useProposal(proposalId);
```

### `useDashboard(dealId)`
Fetches deal and timeline data with 30-second polling.

```typescript
const { deal, timeline, loading, error, refetch } = useDashboard(dealId);
```

## Styling

- **Tailwind CSS** for all styles (dark theme configured)
- **Framer Motion** for animations (motion.div, motion.button, etc.)
- **CSS Variables** for colors (--sun, --surface, etc.)
- **Custom Scrollbar** styling (amber/gold track)
- **Focus States** with ring-2 ring-sun

## Configuration

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_DOCUSIGN_API_URL=https://demo.docusign.net
```

### Tailwind Colors
```javascript
colors: {
  sun: '#F59E0B',
  'sun-dim': '#92600A',
  surface: '#111111',
  'surface-2': '#181818',
  border: '#222222',
  'dark-bg': '#0F0F0F',
}
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance

- Next.js 14 App Router for optimal routing
- Framer Motion for GPU-accelerated animations
- Recharts for efficient data visualization
- Image optimization with next/image
- Font loading optimized with next/font

## Notes

- All forms use React Hook Form + Zod for validation
- API client includes automatic auth token injection
- 401 errors trigger logout redirect
- All animations use motion variants for consistent timing
- Components are fully responsive (mobile-first)
