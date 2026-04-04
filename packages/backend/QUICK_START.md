# Sunbull AI Backend - Quick Start Guide

## Project Created

Complete production-ready Node.js/Express API backend for Sunbull AI solar sales automation platform.

## File Structure

```
backend/
├── src/
│   ├── index.ts                    # Main Express app
│   ├── config/                     # Database, Redis, env config
│   ├── middleware/                 # Auth, tenant, validation, errors
│   ├── routes/                     # 8 API route modules
│   ├── controllers/                # 8 business logic controllers
│   ├── services/                   # 11 external API integrations
│   ├── jobs/                       # 4 background job workers
│   ├── migrations/                 # Database schema
│   ├── types/                      # TypeScript interfaces
│   └── utils/                      # Logger, response formatters
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment template
├── docker-compose.yml              # Local dev environment
├── Dockerfile                      # Production container
└── README.md                       # Full documentation
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your API keys and database credentials
```

### 3. Start Local Services
```bash
docker-compose up -d
# Starts PostgreSQL and Redis
```

### 4. Run Migrations
```bash
npm run migrate
# Creates database tables
```

### 5. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

Test health endpoint:
```bash
curl http://localhost:3000/health
```

## Key Files by Category

### Configuration
- `src/config/index.ts` - Load all env vars
- `src/config/database.ts` - PostgreSQL connection pool
- `src/config/redis.ts` - Redis client + cache helpers

### Request Handling
- `src/middleware/auth.ts` - JWT + magic link auth
- `src/middleware/tenant.ts` - Multi-tenant isolation
- `src/middleware/validate.ts` - Input validation
- `src/middleware/errorHandler.ts` - Global error handling

### API Routes (30+ endpoints)
- `src/routes/leads.ts` - Lead intake
- `src/routes/proposals.ts` - Proposal generation
- `src/routes/deals.ts` - Deal management
- `src/routes/checkout.ts` - Payment flow
- `src/routes/installers.ts` - Installer directory
- `src/routes/auth.ts` - Authentication
- `src/routes/tenants.ts` - Tenant config
- `src/routes/webhooks.ts` - External webhooks

### Business Logic Controllers
- `src/controllers/leadController.ts` - Create leads, dedup, CRM sync
- `src/controllers/proposalController.ts` - Generate proposals (Google Solar → ML → Lenders)
- `src/controllers/dealController.ts` - Deal lifecycle
- `src/controllers/checkoutController.ts` - Payment routing, DocuSign
- `src/controllers/installerController.ts` - Installer CRUD
- `src/controllers/authController.ts` - Login, magic links
- `src/controllers/tenantController.ts` - Tenant management
- `src/controllers/webhookController.ts` - Process webhooks

### External Service Integrations
- `src/services/googleSolar.ts` - Roof analysis
- `src/services/pvwatts.ts` - Solar production
- `src/services/openei.ts` - Utility rates
- `src/services/billOcr.ts` - Bill extraction
- `src/services/lenders.ts` - Financing pre-qual
- `src/services/docusign.ts` - eSignatures
- `src/services/twilio.ts` - SMS
- `src/services/sendgrid.ts` - Email
- `src/services/stripe.ts` - Payments
- `src/services/hubspot.ts` - CRM
- `src/services/mlService.ts` - ML models

### Background Jobs
- `src/jobs/proposalPipeline.ts` - Full proposal generation
- `src/jobs/abandonmentFollowUp.ts` - SMS + email reminders
- `src/jobs/npsFollowUp.ts` - Customer surveys
- `src/jobs/referralEngine.ts` - Referral tracking

## Database Tables

Automatically created by migrations:

1. **tenants** - SaaS tenant accounts
2. **users** - Admin/rep/installer accounts
3. **leads** - Customer intake records
4. **proposals** - System analysis with ROI
5. **deals** - Customer agreements
6. **installers** - Installation company directory
7. **abandonment_reminders** - Follow-up tracking
8. **nps_surveys** - Customer satisfaction
9. **referral_links** - Referral codes
10. **referral_conversions** - Referral attribution

## API Examples

### Create Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St, San Francisco, CA 94102",
    "tcpaConsent": true
  }'
```

### Generate Proposal
```bash
curl -X POST http://localhost:3000/api/v1/proposals/generate \
  -H "Content-Type: application/json" \
  -d '{"leadId": "<lead-uuid>"}'
```

### Get Lead Proposals
```bash
curl http://localhost:3000/api/v1/proposals/lead/<lead-id>
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password"
  }'
```

### Request with Auth
```bash
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:3000/api/v1/leads
```

## Response Format

Success (200):
```json
{
  "success": true,
  "data": { "id": "...", "email": "..." },
  "statusCode": 200,
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

Error (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

## Scripts

```bash
npm run dev        # Development with nodemon
npm run build      # Compile TypeScript
npm start          # Run production build
npm run migrate    # Run database migrations
npm test           # Run tests (jest)
npm run lint       # Lint code
```

## Environment Variables

Key variables in `.env`:

```
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=sunbull_user
DB_PASSWORD=password
DB_NAME=sunbull_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secret
JWT_EXPIRY=24h

# External APIs
GOOGLE_SOLAR_API_KEY=...
NREL_API_KEY=...
OPENAI_API_KEY=...
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Lenders
GOODLEAP_API_KEY=...
MOSAIC_API_KEY=...
SUNLIGHT_API_KEY=...
LIGHTREACH_API_KEY=...

# DocuSign
DOCUSIGN_INTEGRATOR_KEY=...
DOCUSIGN_USERNAME=...
DOCUSIGN_PASSWORD=...
DOCUSIGN_ACCOUNT_ID=...

# Stripe
STRIPE_SECRET_KEY=...

# HubSpot
HUBSPOT_API_KEY=...

# ML Service
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_API_KEY=...
```

## Development Tips

### Enable Detailed Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Test Database Queries
```bash
npm run migrate
# Then use psql
psql -U sunbull_user -d sunbull_dev
```

### Mock External APIs
In development, API calls to Twilio, SendGrid, etc. will log but not fail if keys are missing.

### Debug TypeScript
```bash
# Watch and compile
npm run build -- --watch

# In VSCode, use debugger:
# Set breakpoints and press F5
```

## Production Deployment

### Build Docker Image
```bash
docker build -t sunbull-backend:latest .
```

### Run Container
```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  sunbull-backend:latest
```

### Deploy to AWS, GCP, Azure
See deployment docs for cloud-specific instructions.

## Troubleshooting

### Port 3000 in use
```bash
lsof -i :3000
kill -9 <PID>
```

### PostgreSQL connection failed
```bash
# Check if postgres is running
docker-compose ps

# Restart services
docker-compose restart postgres
```

### Redis connection failed
```bash
# Check Redis
docker-compose logs redis

# Restart
docker-compose restart redis
```

### TypeScript errors
```bash
npm run build  # Compile and see errors
npm install    # Install missing types
```

## Next Steps

1. **Configure API keys** in `.env`
2. **Run migrations** with `npm run migrate`
3. **Start development** with `npm run dev`
4. **Create sample lead** with POST /leads
5. **Generate proposal** with POST /proposals/generate
6. **Review logs** in `logs/combined.log`

## Documentation

- Full API docs: See `README.md`
- Architecture details: See `IMPLEMENTATION_SUMMARY.md`
- File manifest: See `FILES_CREATED.txt`

## Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review error responses for details
3. Verify `.env` configuration
4. Ensure external services are accessible

---

Built with Node.js, Express, TypeScript, PostgreSQL, Redis
