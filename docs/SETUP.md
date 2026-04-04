# Sunbull AI Platform - Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Python 3.9+ (for ML service)
- Git

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd sunbull-ai-platform
npm install
```

### 2. Environment Configuration

Copy the example environment file and update with your API keys:

```bash
cp .env.example .env
```

Edit `.env` with:
- Database credentials
- API keys (Google, NREL, OpenAI, etc.)
- Authentication details (Auth0)
- Service credentials (Twilio, SendGrid, Stripe, etc.)

### 3. Docker Setup

Start all services with Docker Compose:

```bash
npm run docker:up
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 4000)
- Frontend (port 3000)
- Admin Dashboard (port 3001)
- ML Service (port 8000)

View logs:
```bash
npm run docker:logs
```

Stop services:
```bash
npm run docker:down
```

### 4. Database Setup

Run migrations:

```bash
npm run db:migrate
```

Seed sample data (optional):

```bash
npm run db:seed
```

### 5. Access Applications

- **Customer App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:4000/api
- **ML Service**: http://localhost:8000

## Development Workflow

### Running Individual Services

Without Docker, run services locally:

```bash
# Terminal 1: Backend
cd packages/backend
npm install
npm run dev

# Terminal 2: Frontend
cd packages/frontend
npm install
npm run dev

# Terminal 3: Admin
cd packages/admin
npm install
npm run dev

# Terminal 4: ML Service
cd packages/ml-service
pip install -r requirements.txt
npm run dev
```

### Code Quality

Format code:
```bash
npm run format
```

Run linting:
```bash
npm run lint
```

Run tests:
```bash
npm run test
```

## Production Deployment

### Build Docker Images

```bash
npm run docker:build
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f infra/k8s/namespace.yaml

# Create secrets (update values first)
kubectl create secret generic backend-secrets \
  -n sunbull-ai \
  --from-literal=database-url=postgresql://...

# Deploy services
kubectl apply -f infra/k8s/
```

### Environment Variables for Production

1. Use secure secret management (AWS Secrets Manager, HashiCorp Vault)
2. Rotate API keys regularly
3. Use strong JWT secrets
4. Enable HTTPS/TLS
5. Configure rate limiting
6. Set up monitoring & alerting

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec sunbull-postgres psql -U sunbull -d sunbull_db -c "SELECT 1"

# View logs
npm run docker:logs postgres
```

### Redis Connection Issues

```bash
# Test Redis connection
docker exec sunbull-redis redis-cli ping

# View logs
npm run docker:logs redis
```

### API Issues

```bash
# View backend logs
npm run docker:logs backend

# Check API health
curl http://localhost:4000/health
```

### ML Service Issues

```bash
# View ML service logs
npm run docker:logs ml-service

# Check ML service health
curl http://localhost:8000/health
```

## Environment Variables Reference

See `.env.example` for the complete list of required environment variables with descriptions.

## Next Steps

1. Configure your API keys in `.env`
2. Start Docker Compose: `npm run docker:up`
3. Run database migrations: `npm run db:migrate`
4. Access the frontend at http://localhost:3000
5. Read the API documentation in `/docs/API.md`
