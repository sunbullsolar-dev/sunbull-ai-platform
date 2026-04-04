# Sunbull AI Admin Dashboard - Installation & Setup Guide

## Prerequisites

- Node.js 16+ 
- npm or yarn package manager

## Installation

```bash
cd /sessions/sharp-sleepy-mccarthy/mnt/Sunbull.ai\ v3/sunbull-ai-platform/packages/admin
npm install
```

## Development

Start the development server on port 3001:

```bash
npm run dev
```

Navigate to `http://localhost:3001` in your browser.

## Production Build

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Layout

### Root Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript compiler options
- `tsconfig.node.json` - TypeScript config for Node files
- `index.html` - HTML entry point
- `.gitignore` - Git ignore patterns

### Source Directory (`src/`)

#### Application Core
- `main.tsx` - React entry point with BrowserRouter and ThemeProvider
- `App.tsx` - Route definitions for all admin pages
- `theme.ts` - MUI dark theme configuration with Sunbull colors

#### Layout Components (`src/components/layout/`)
- `Sidebar.tsx` - Collapsible navigation sidebar with sections
- `TopBar.tsx` - Header with search, notifications, and user menu
- `AdminLayout.tsx` - Main layout wrapper combining sidebar and topbar

#### Reusable Components (`src/components/common/`)
- `DataTable.tsx` - Feature-rich data table with sorting, filtering, pagination, selection
- `StatCard.tsx` - KPI metric cards with trend indicators
- `StatusBadge.tsx` - Color-coded status badges for leads, deals, installers
- `SearchBar.tsx` - Debounced search input component
- `DateRangePicker.tsx` - Date range selector with apply button
- `ConfirmDialog.tsx` - Confirmation modal for destructive actions

#### API & Hooks (`src/lib/`)
- `api.ts` - Axios API client with endpoints for leads, deals, installers, tenants, analytics
- `hooks/useLeads.ts` - Custom hooks for lead data fetching
- `hooks/useDeals.ts` - Custom hooks for deal data fetching
- `hooks/useAnalytics.ts` - Custom hooks for analytics data fetching

#### Pages (`src/pages/`)

**Dashboard**
- `Dashboard.tsx` - KPI overview with revenue trend, funnel, installers table, activity feed

**Lead Management**
- `Leads.tsx` - Lead listing with filtering and search
- `LeadDetail.tsx` - Individual lead profile with proposals and communication history

**Proposal Management**
- `Proposals.tsx` - Proposal listing with status tracking

**Deal Pipeline**
- `Deals.tsx` - Kanban/list view of deal pipeline with 9 stages
- `DealDetail.tsx` - Deal details with stage transitions and financial info

**Installer Management**
- `Installers.tsx` - Installer network with performance metrics
- `InstallerDetail.tsx` - Installer profile with certifications, NPS trend, job history

**Tenant Management**
- `Tenants.tsx` - SaaS tenant listing with plan and usage info
- `TenantDetail.tsx` - Tenant configuration, branding, and usage statistics

**Analytics & Settings**
- `Analytics.tsx` - Comprehensive analytics with revenue, sources, funnel, NPS, MRR trends
- `Settings.tsx` - Platform configuration for general, features, email, payment, API

## Routing Structure

```
/                    -> Dashboard
/dashboard           -> Dashboard overview
/leads               -> Lead list with filters
/leads/:id           -> Individual lead details
/proposals           -> Proposal management
/deals               -> Deal pipeline (Kanban/List)
/deals/:id           -> Deal details with timeline
/installers          -> Installer network
/installers/:id      -> Installer profile & performance
/tenants             -> SaaS tenant management
/tenants/:id         -> Tenant config & usage
/analytics           -> Analytics dashboard
/settings            -> Platform settings
```

## Color Scheme

The dashboard uses a consistent dark theme matching the main Sunbull site:

| Element | Color | Hex |
|---------|-------|-----|
| Background | Very Dark Gray | #080808 |
| Surface | Dark Gray | #111111 |
| Paper/Card | Darker Gray | #181818 |
| Primary Text | Light Gray | #D4D4D4 |
| Secondary Text | Medium Gray | #9CA3AF |
| Primary Accent | Amber | #F59E0B |
| Success | Green | #10B981 |
| Error | Red | #EF4444 |
| Info | Blue | #3B82F6 |
| Borders | Dark Gray | #262626 |

## Mock Data

All pages include comprehensive mock data for demonstration:
- Sample leads with various statuses and scores
- Proposals at different stages
- Deals across pipeline stages
- Installer performance metrics
- Tenant plans and usage
- Analytics trends and distributions

To connect to real API data, modify the page components to use the custom hooks from `lib/hooks/` which fetch from the configured API endpoint.

## API Integration

The dashboard is ready to connect to a backend API. Configure the API base URL in `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
```

Set the environment variable:
```bash
export REACT_APP_API_URL=https://your-api.com/api
```

API endpoints are organized by resource:
- `/leads` - Lead CRUD and bulk operations
- `/proposals` - Proposal management
- `/deals` - Deal management with stage transitions
- `/installers` - Installer management
- `/tenants` - SaaS tenant management
- `/analytics/*` - Various analytics queries

## Components & Features

### DataTable
- Sortable columns
- Pagination with configurable row limits
- Row selection with select-all
- Click handlers for navigation
- Custom column rendering

### StatusBadge
- Semantic color coding
- Status types for leads, deals, installers, tenants
- Configurable variant (filled/outlined)

### Charts
- Revenue trend with targets
- Lead source pie chart
- Conversion funnel
- Installer performance comparison
- NPS distribution
- MRR trend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Lazy loading of route components
- Debounced search input (300ms default)
- Pagination for large datasets
- Memoized components where appropriate
- CSS-in-JS with Emotion for optimized styles

## Customization

### Theme Colors
Edit `src/theme.ts` to customize the color scheme:

```typescript
palette: {
  primary: {
    main: '#F59E0B', // Change primary color
  },
  background: {
    default: '#080808', // Change background
  },
  // ... other colors
}
```

### Navigation Items
Edit `src/components/layout/Sidebar.tsx` to add/remove navigation items:

```typescript
const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      // Add more items here
    ],
  },
]
```

### Mock Data
Replace mock data in each page file with real API calls using the custom hooks.

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, modify `vite.config.ts`:

```typescript
server: {
  port: 3002 // or another available port
}
```

### Module Not Found
Run `npm install` to ensure all dependencies are installed.

### TypeScript Errors
Make sure TypeScript version is 5.3+ and run:
```bash
npm run build
```

## Next Steps

1. Connect to real backend API by implementing data fetching in page components
2. Add user authentication and authorization
3. Implement form submissions for CRUD operations
4. Add real-time updates with WebSockets or polling
5. Implement user preferences and settings storage
6. Add activity logging and audit trails
7. Implement export functionality for reports

## Support

For issues or questions about the admin dashboard, refer to the BUILD_SUMMARY.md file for detailed component documentation.
