# Sunbull AI Platform v3

Full-stack solar sales automation platform with AI-powered lead scoring, solar design optimization, and financing integration.

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Python 3.9+ (for ML service)

### Setup

1. Clone the repository and navigate to the project:
```bash
cd sunbull-ai-platform
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API keys and configuration

4. Start all services with Docker Compose:
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

### Development

To run services locally without Docker:

```bash
# Install dependencies
npm install

# Start all services in development mode
npm run dev

# Run tests
npm run test

# Format code
npm run format
```

### Project Structure

```
sunbull-ai-platform/
├── packages/
│   ├── frontend/          # Next.js 14 customer application
│   ├── backend/           # Node.js + Express API
│   ├── ml-service/        # Python FastAPI ML service
│   ├── shared/            # Shared types and utilities
│   └── admin/             # React admin dashboard
├── database/
│   └── migrations/        # SQL migrations
├── infra/
│   ├── docker/            # Dockerfiles
│   └── k8s/               # Kubernetes manifests
└── docs/                  # Documentation
```

## Documentation

See `/docs` for detailed documentation on architecture, API endpoints, and deployment.

## License

Proprietary - Sunbull AI
