# Sunbull AI Platform - Project Structure Guide

## Directory Overview

```
sunbull-ai-platform/
├── packages/                          # Monorepo workspace packages
│   ├── backend/                       # Node.js + Express REST API
│   │   └── package.json
│   ├── frontend/                      # Next.js 14 customer application
│   │   └── package.json
│   ├── admin/                         # React admin dashboard
│   │   └── package.json
│   ├── ml-service/                    # Python FastAPI ML service
│   │   ├── package.json
│   │   └── requirements.txt
│   └── shared/                        # Shared TypeScript types & utilities
│       └── package.json
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql     # Initial database schema
│       └── 002_seed_data.sql          # Sample data (optional)
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.backend         # Backend container image
│   │   ├── Dockerfile.frontend        # Frontend container image
│   │   ├── Dockerfile.admin           # Admin container image
│   │   └── Dockerfile.ml-service      # ML service container image
│   └── k8s/                           # Kubernetes manifests
│       ├── namespace.yaml             # K8s namespace definition
│       ├── backend-deployment.yaml    # Backend service deployment
│       ├── frontend-deployment.yaml   # Frontend service deployment
│       ├── ml-service-deployment.yaml # ML service deployment
│       ├── database-statefulset.yaml  # PostgreSQL StatefulSet
│       ├── redis-deployment.yaml      # Redis deployment
│       └── ingress.yaml               # Ingress routing configuration
├── docs/
│   ├── ARCHITECTURE.md                # System architecture overview
│   ├── SETUP.md                       # Development setup guide
│   ├── API.md                         # API documentation (to create)
│   └── PROJECT_STRUCTURE.md           # This file
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── .dockerignore                      # Docker build ignore rules
├── docker-compose.yml                 # Local development compose file
├── package.json                       # Root workspace configuration
└── README.md                          # Project overview & quick start
```

## Package Descriptions

### Backend (`packages/backend`)

Main API server built with Express.js

**Responsibilities:**
- User authentication & authorization (Auth0 integration)
- Customer & lead management
- Solar design & quote generation
- Document management & DocuSign integration
- Payment processing (Stripe)
- External API integrations
- Database operations

**Key Technologies:**
- Express.js
- PostgreSQL client (pg)
- Redis client
- JWT authentication
- Joi/Zod validation
- TypeScript

**Environment:** Node.js 18+

### Frontend (`packages/frontend`)

Customer-facing web application built with Next.js 14

**Responsibilities:**
- User onboarding & lead capture
- Interactive solar system design
- Quote viewing & comparison
- Document signing (DocuSign embedded)
- Payment processing
- Customer dashboard
- Real-time notifications

**Key Technologies:**
- Next.js 14
- React 18
- Tailwind CSS
- React Query
- Zustand (state management)
- React Hook Form
- TypeScript

**Environment:** Node.js 18+

### Admin Dashboard (`packages/admin`)

Internal management portal for sales team

**Responsibilities:**
- Sales pipeline management
- Lead assignment & scoring
- Quote approval workflow
- Customer analytics & reporting
- Team performance metrics
- System configuration
- Integration management

**Key Technologies:**
- React 18
- Vite (build tool)
- Ant Design (component library)
- Recharts (charting)
- React Router
- Zustand
- TypeScript

**Environment:** Node.js 18+

### ML Service (`packages/ml-service`)

Python-based service for AI/ML operations

**Responsibilities:**
- Lead scoring using ML models
- Solar potential prediction
- Production estimation (PVWatts integration)
- System size optimization
- Demand forecasting
- Model training & evaluation
- API endpoints for ML predictions

**Key Technologies:**
- FastAPI
- Pydantic
- NumPy/Pandas
- Scikit-learn
- TensorFlow/PyTorch
- OpenAI API integration
- NREL APIs

**Environment:** Python 3.11

### Shared (`packages/shared`)

Reusable TypeScript code across packages

**Contents:**
- Type definitions (User, Customer, Quote, etc.)
- Constants & enums
- Validation schemas (Zod)
- Utility functions
- API client helpers

**Environment:** TypeScript / Node.js 18+

## Infrastructure

### Docker (`infra/docker`)

Container images for each service with development configurations

**Services:**
1. **Backend** - Express API (Node.js 18 Alpine)
2. **Frontend** - Next.js app (Node.js 18 Alpine)
3. **Admin** - React app (Node.js 18 Alpine)
4. **ML Service** - FastAPI (Python 3.11 Slim)

All images include:
- Proper working directories
- Dependency installation
- Health check configurations
- Volume mounts for development

### Kubernetes (`infra/k8s`)

Production-ready Kubernetes manifests

**Components:**
- `namespace.yaml` - Dedicated namespace for the platform
- `backend-deployment.yaml` - Backend replicas with service
- `frontend-deployment.yaml` - Frontend with LoadBalancer
- `ml-service-deployment.yaml` - ML service with resources
- `database-statefulset.yaml` - PostgreSQL with persistent storage
- `redis-deployment.yaml` - Redis with persistent volume
- `ingress.yaml` - External routing (sunbull.ai, api.sunbull.ai, admin.sunbull.ai)

## Configuration Files

### Root Level

**package.json**
- Monorepo workspace configuration
- Common npm scripts
- Shared devDependencies
- Workspace definitions pointing to all packages

**docker-compose.yml**
- Local development environment
- 6 services: postgres, redis, backend, frontend, admin, ml-service
- Volume mounts for hot-reloading
- Environment variable configuration
- Health checks & service dependencies
- Network configuration

**.env.example**
- All required environment variables
- Organized by category:
  - Database & Caching
  - Solar & Location APIs
  - AI & Machine Learning
  - Communication Services
  - Document & Signature
  - Financing Services
  - Payment Processing
  - Authentication
  - CRM & Marketing
  - Security & Encryption
  - Cloud & Storage
  - External Services
  - Application Settings
  - Development & Debugging

**.gitignore**
- Comprehensive patterns for all environments
- Node.js artifacts
- Python artifacts
- Build outputs
- IDE files
- OS files
- Environment files

**.dockerignore**
- Optimized Docker builds
- Excludes unnecessary files
- Reduces image size

**README.md**
- Project overview
- Quick start instructions
- Prerequisites
- Docker setup commands
- Project structure outline
- Documentation reference

## Database

### Migrations (`database/migrations`)

**001_initial_schema.sql**
- PostgreSQL 15 schema creation
- Extensions: uuid-ossp, pgcrypto
- Core tables:
  - Users & authentication
  - Customers & leads
  - Solar designs & quotes
  - Financing options
  - Proposals & documents
  - Communications & appointments
  - Transactions & payments
  - Activity logging
- Indexes for performance optimization
- Foreign key relationships
- Constraints & defaults

**002_seed_data.sql** (optional)
- Sample users, customers, leads
- Test quotes and designs
- Example appointments
- Demo data for development

## Documentation (`docs`)

**ARCHITECTURE.md**
- System architecture overview
- Technology stack details
- Service architecture diagram
- Core module descriptions
- Database schema overview
- Integration points
- Deployment strategies
- Security considerations
- Performance optimizations

**SETUP.md**
- Local development setup steps
- Docker setup instructions
- Database initialization
- Environment configuration
- Access URLs
- Development workflow
- Code quality tools
- Production deployment guide
- Troubleshooting section

**PROJECT_STRUCTURE.md** (this file)
- Directory overview
- Package descriptions
- Infrastructure details
- Configuration explanations
- Getting started guide

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd sunbull-ai-platform
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start services**
   ```bash
   npm run docker:up
   ```

4. **Access applications**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3001
   - Backend API: http://localhost:4000
   - ML Service: http://localhost:8000

5. **Next steps**
   - Read SETUP.md for detailed instructions
   - Check ARCHITECTURE.md for system design
   - Review database schema in migrations
   - Explore API endpoints

## Scripts Reference

### Root Level (`npm` commands)
- `npm install` - Install all dependencies
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start Docker Compose
- `npm run docker:down` - Stop Docker Compose
- `npm run docker:logs` - View Docker logs
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Key Environment Variables

**Database**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**APIs**
- `GOOGLE_SOLAR_API_KEY` - Google Solar API
- `NREL_PVWATTS_API_KEY` - NREL PVWatts
- `OPENAI_API_KEY` - OpenAI for AI features

**Services**
- `TWILIO_ACCOUNT_SID` - SMS service
- `SENDGRID_API_KEY` - Email service
- `STRIPE_SECRET_KEY` - Payment processing
- `DOCUSIGN_INTEGRATION_KEY` - Document signing

**Authentication**
- `AUTH0_DOMAIN` - Auth0 configuration
- `JWT_SECRET` - JWT signing key
- `ENCRYPTION_KEY` - Data encryption

See `.env.example` for complete reference.

## Next Steps

1. Install dependencies: `npm install`
2. Copy environment template: `cp .env.example .env`
3. Update environment variables
4. Start services: `npm run docker:up`
5. Access http://localhost:3000
6. Read development guides in `/docs`
