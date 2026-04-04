# Sunbull AI Backend API

Production-ready Node.js/Express API server for the Sunbull AI solar sales automation platform.

## Features

- **Multi-tenant SaaS architecture** with subdomain-based tenant detection
- **Complete proposal generation pipeline** integrating Google Solar, NREL, and ML services
- **Payment integration** with multiple lenders (GoodLeap, Mosaic, Sunlight, Lightreach)
- **DocuSign eSignature** for seamless contract signing
- **SMS & Email automation** via Twilio and SendGrid
- **Lead management** with TCPA compliance
- **Installer assignment** and scheduling
- **Abandonment follow-up** and NPS surveys
- **Referral tracking** and conversion attribution

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Setup

```bash
npm run migrate
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Structure

### Core Routes

- `/api/v1/leads` - Lead intake and management
- `/api/v1/proposals` - Proposal generation and retrieval
- `/api/v1/deals` - Deal lifecycle management
- `/api/v1/checkout` - Payment flow and DocuSign signing
- `/api/v1/installers` - Installer directory and assignment
- `/api/v1/auth` - Authentication (JWT + Magic Links)
- `/api/v1/tenants` - Tenant management
- `/api/v1/webhooks` - External service webhooks

## Key Services

### External Integrations
- **Google Solar API** - Roof analysis (shading, area, azimuth, pitch)
- **NREL PVWatts** - System production calculations
- **OpenEI** - Utility rate lookups
- **OpenAI Vision** - Utility bill OCR

### Financing & Legal
- **GoodLeap, Mosaic, Sunlight, Lightreach** - Pre-qualification APIs
- **DocuSign** - eSignature and document execution
- **Stripe** - Payment processing and installer payouts

### Communication
- **Twilio** - SMS messaging and TCPA compliance
- **SendGrid** - Email delivery and campaigns

### CRM & ML
- **HubSpot** - Contact and deal sync
- **ML Service** (internal) - System sizing, ROI, copy generation

## Database Schema

Tables:
- `tenants` - Tenant accounts
- `users` - Admin/rep/installer accounts
- `leads` - Customer intake records
- `proposals` - Solar proposals with system analysis
- `deals` - Customer agreements and payment terms
- `installers` - Installation company directory
- `abandonment_reminders` - Follow-up tracking
- `nps_surveys` - Customer satisfaction surveys
- `referral_links` - Referral program tracking

## Jobs/Background Tasks

- **Proposal Pipeline** - Orchestrates full proposal generation (Google Solar → NREL → ML)
- **Abandonment Follow-up** - SMS reminder at 30 min, email at 60 min
- **NPS Surveys** - Sends survey 31 days post-installation
- **Referral Engine** - Generates and tracks referral links

## Authentication

### Admin/Rep Login
```bash
POST /api/v1/auth/login
{
  "email": "user@company.com",
  "password": "password"
}
```

### Homeowner Magic Link
```bash
POST /api/v1/auth/magic-link
{ "email": "homeowner@email.com" }
```

## Webhook Handlers

- `POST /api/v1/webhooks/docusign` - Document signing status
- `POST /api/v1/webhooks/lender` - Financing approval/denial
- `POST /api/v1/webhooks/twilio` - SMS delivery status
- `POST /api/v1/webhooks/stripe` - Payment confirmations

## Error Handling

All errors return standardized JSON responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

## Logging

Logs written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only
- Console in development mode

## Rate Limiting

- 100 requests per 15 minutes per IP
- Disabled in development mode
- Configurable via express-rate-limit

## Performance

- Redis caching for API calls (Google Solar, utility rates)
- Connection pooling (20 concurrent DB connections)
- Compression enabled for responses
- Request validation before processing

## Security

- CORS enabled with configurable origins
- Helmet.js for security headers
- JWT authentication with 24-hour expiry
- Magic link tokens expire after 15 minutes
- TCPA consent tracking and opt-out processing

## Testing

```bash
npm test
```

## Deployment

See `/docs/deployment.md` for cloud deployment instructions.

## License

Proprietary - Sunbull AI
