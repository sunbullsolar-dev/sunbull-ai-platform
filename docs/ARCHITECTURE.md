# Sunbull AI Platform - Architecture

## Overview

Sunbull AI is a full-stack solar sales automation platform built with a modern microservices architecture. The platform combines AI-powered lead scoring, solar design optimization, and financing integration to streamline the solar sales process.

## System Architecture

### Technology Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Admin Dashboard**: React with Vite
- **Backend API**: Node.js + Express with TypeScript
- **ML Service**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Authentication**: Auth0
- **Cloud Storage**: Google Cloud Storage / AWS S3
- **Container Orchestration**: Docker Compose (development), Kubernetes (production)

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────┬──────────────────┬────────────────────┤
│  Customer App       │  Admin Dashboard │  Mobile (Future)   │
│  (Next.js 14)       │  (React)         │                    │
└──────────┬──────────┴─────────┬────────┴────────────┬────────┘
           │                    │                     │
           ▼                    ▼                     ▼
      ┌─────────────────────────────────────────────────────┐
      │         API Gateway / Load Balancer                  │
      │                  (Port 4000)                         │
      └──────────────────────┬────────────────────────────────┘
           │                 │                      │
           ▼                 ▼                      ▼
      ┌──────────────┐  ┌──────────────┐  ┌───────────────┐
      │  Backend API │  │ ML Service   │  │  Auth Service │
      │  (Express)   │  │  (FastAPI)   │  │  (Auth0)      │
      │  Port 4000   │  │  Port 8000   │  │               │
      └──────┬───────┘  └──────┬───────┘  └───────────────┘
             │                 │
             └─────────┬───────┘
                       ▼
           ┌──────────────────────┐
           │   Data Layer         │
           ├──────────┬───────────┤
           │PostgreSQL│  Redis    │
           │  (5432)  │  (6379)   │
           └──────────┴───────────┘
                       ▼
           ┌──────────────────────┐
           │  External Services   │
           ├──────────┬───────────┤
           │ Google   │ Financing │
           │ APIs     │ Providers │
           │ Twilio   │ DocuSign  │
           │ Stripe   │ HubSpot   │
           └──────────┴───────────┘
```

## Core Modules

### 1. Backend API (`/packages/backend`)

The main REST API handling:
- User authentication & authorization
- Customer & lead management
- Solar design & quote generation
- Document management
- Payment processing
- Integration with external APIs

**Key Endpoints**:
- `/api/auth/*` - Authentication
- `/api/customers/*` - Customer management
- `/api/leads/*` - Lead scoring & assignment
- `/api/quotes/*` - Quote generation
- `/api/designs/*` - Solar system designs
- `/api/financing/*` - Financing options
- `/api/documents/*` - Document management

### 2. Frontend App (`/packages/frontend`)

Customer-facing application with:
- Lead capture forms
- Solar design visualization
- Quote presentation
- Document signing (DocuSign integration)
- Payment processing
- Customer dashboard

### 3. Admin Dashboard (`/packages/admin`)

Internal tools for:
- Sales team management
- Lead assignment
- Quote approval workflow
- Customer analytics
- Performance metrics
- Integration configuration

### 4. ML Service (`/packages/ml-service`)

Python-based service for:
- Lead scoring using ML models
- Solar potential prediction
- Production estimation (PVWatts)
- System size optimization
- Demand forecasting

### 5. Shared Package (`/packages/shared`)

Shared TypeScript types, constants, and utilities:
- API request/response types
- Business logic types
- Common utilities
- Validation schemas (Zod)

## Database Schema

### Core Tables

- **users** - User accounts & authentication
- **customers** - Customer records
- **leads** - Lead scoring & tracking
- **solar_designs** - System design specifications
- **quotes** - Financial quotes
- **financing_options** - Financing alternatives
- **proposals** - Signed proposals
- **communications** - Customer communications
- **appointments** - Scheduled meetings
- **documents** - Uploaded documents
- **transactions** - Payment records
- **activity_logs** - Audit trail

## Integration Points

### External APIs

1. **Google Cloud**
   - Solar API (roof analysis)
   - Maps API (geolocation)
   - Cloud Storage (document storage)

2. **NREL PVWatts**
   - Solar production estimation
   - System performance modeling

3. **Financing Providers**
   - GoodLeap, Mosaic, Sunlight, Lightreach

4. **Communication**
   - Twilio (SMS)
   - SendGrid (Email)
   - HubSpot (CRM)

5. **Document Management**
   - DocuSign (E-signatures)

6. **Payment Processing**
   - Stripe (Credit card payments)

7. **Authentication**
   - Auth0 (Identity management)

## Deployment

### Development
- Docker Compose with all services
- Hot-reloading enabled
- Database seeding
- Mock external services (optional)

### Production
- Kubernetes orchestration
- PostgreSQL with replication
- Redis clustering
- CDN for static assets
- Auto-scaling policies
- CI/CD pipeline integration

## Security

- JWT authentication with refresh tokens
- Row-level security (RLS) in database
- API rate limiting
- CORS configuration
- Encrypted sensitive data
- Audit logging
- Environment-based secrets management

## Performance

- Database indexing on frequently queried fields
- Redis caching layer
- API response pagination
- Query optimization
- Connection pooling
- Async/await patterns
