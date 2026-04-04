#!/bin/bash
# ============================================================================
# SUNBULL AI PLATFORM - QUICK REFERENCE COMMANDS
# ============================================================================

echo "==============================================="
echo "SUNBULL AI PLATFORM v3 - QUICK COMMANDS"
echo "==============================================="
echo ""

# Initial Setup
echo "INITIAL SETUP:"
echo "  1. Copy environment: cp .env.example .env"
echo "  2. Edit .env with your API keys"
echo "  3. Install deps: npm install"
echo ""

# Docker Commands
echo "DOCKER COMMANDS:"
echo "  npm run docker:build      # Build all Docker images"
echo "  npm run docker:up         # Start all services"
echo "  npm run docker:down       # Stop all services"
echo "  npm run docker:logs       # View service logs"
echo ""

# Database Commands
echo "DATABASE COMMANDS:"
echo "  npm run db:migrate        # Run database migrations"
echo "  npm run db:seed           # Seed sample data"
echo ""

# Development Commands
echo "DEVELOPMENT COMMANDS:"
echo "  npm run dev               # Start all services (no Docker)"
echo "  npm run build             # Build all packages"
echo "  npm run test              # Run tests"
echo "  npm run lint              # Lint code"
echo "  npm run format            # Format with Prettier"
echo ""

# Service Access
echo "SERVICE ACCESS:"
echo "  Frontend:     http://localhost:3000"
echo "  Admin:        http://localhost:3001"
echo "  Backend API:  http://localhost:4000/api"
echo "  ML Service:   http://localhost:8000"
echo "  PostgreSQL:   localhost:5432"
echo "  Redis:        localhost:6379"
echo ""

# Kubernetes
echo "KUBERNETES DEPLOYMENT:"
echo "  kubectl apply -f infra/k8s/namespace.yaml"
echo "  kubectl apply -f infra/k8s/backend-deployment.yaml"
echo "  kubectl apply -f infra/k8s/frontend-deployment.yaml"
echo "  kubectl apply -f infra/k8s/ml-service-deployment.yaml"
echo "  kubectl apply -f infra/k8s/database-statefulset.yaml"
echo "  kubectl apply -f infra/k8s/redis-deployment.yaml"
echo "  kubectl apply -f infra/k8s/ingress.yaml"
echo ""

# Troubleshooting
echo "TROUBLESHOOTING:"
echo "  docker ps                 # List running containers"
echo "  docker logs <container>   # View container logs"
echo "  docker exec -it <container> /bin/bash"
echo "  npm run docker:logs       # View all service logs"
echo ""

echo "==============================================="
echo "For detailed setup, see: docs/SETUP.md"
echo "For architecture info, see: docs/ARCHITECTURE.md"
echo "==============================================="
