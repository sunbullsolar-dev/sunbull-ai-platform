# Sunbull AI ML Service - Deployment Guide

## Service Overview

Complete production-ready FastAPI ML service with 5 core AI/ML modules:

1. **System Sizing Model** - XGBoost solar system recommendations
2. **ROI Calculator** - 25-year NPV financial analysis
3. **Proposal Writer** - GPT-4 personalized copy generation
4. **Lead Scorer** - Logistic regression lead qualification
5. **Lender Ranker** - Algorithm-based financing options

## Directory Structure

```
ml-service/
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker container definition
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore rules
├── README.md                     # User documentation
├── DEPLOYMENT.md                 # This file
│
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app, middleware, lifespan
│   ├── config.py                 # Settings management
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── sizing_model.py       # XGBoost sizing (fallback: rule-based)
│   │   ├── roi_calculator.py     # 25-year NPV calculator
│   │   ├── proposal_writer.py    # GPT-4 proposal generator
│   │   ├── lead_scorer.py        # Lead propensity scoring
│   │   └── lender_ranker.py      # Lender option ranking
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── sizing.py             # POST /api/v1/sizing
│   │   ├── roi.py                # POST /api/v1/roi
│   │   ├── proposal.py           # POST /api/v1/proposal-copy
│   │   ├── scoring.py            # POST /api/v1/lead-score
│   │   └── lender.py             # POST /api/v1/rank-lenders
│   │
│   └── utils/
│       ├── __init__.py
│       ├── cache.py              # Redis caching utilities
│       └── logging.py            # Structured logging setup
```

## Quick Deployment

### Local Development

```bash
# 1. Clone and setup
cd ml-service
cp .env.example .env
# Edit .env with OPENAI_API_KEY

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run service
uvicorn app.main:app --reload --port 8000

# 5. View API docs
# Open http://localhost:8000/docs
```

### Docker Deployment

```bash
# Build image
docker build -t sunbull-ml-service:latest .

# Run with environment
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  -e REDIS_URL=redis://redis:6379 \
  -e ENVIRONMENT=production \
  sunbull-ml-service:latest
```

### Docker Compose (Full Stack)

```bash
# Deploy with Redis
docker-compose up -d
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  ml-service:
    build: .
    ports:
      - "8000:8000"
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      REDIS_URL: redis://redis:6379
      ENVIRONMENT: production
      LOG_LEVEL: INFO
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## API Reference

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "Sunbull AI ML Service",
  "version": "1.0.0",
  "environment": "production"
}
```

### System Sizing
```bash
curl -X POST http://localhost:8000/api/v1/sizing \
  -H "Content-Type: application/json" \
  -d '{
    "roof_area": 2500,
    "usable_solar_area": 2000,
    "monthly_kwh": 800,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "azimuth": 180,
    "pitch": 25,
    "shading_factor": 0.85
  }'
```

Response:
```json
{
  "recommended_kw": 8.0,
  "panel_count": 19,
  "offset_percentage": 98.5,
  "confidence_score": 0.85
}
```

### ROI Analysis (25-Year)
```bash
curl -X POST http://localhost:8000/api/v1/roi \
  -H "Content-Type: application/json" \
  -d '{
    "system_size_kw": 8.0,
    "annual_production_kwh": 12000,
    "current_monthly_bill": 150,
    "utility_rate": 0.18,
    "utility_escalation_rate": 0.03,
    "panel_cost_per_watt": 2.50,
    "itc_percentage": 30,
    "nem_version": "3.0",
    "export_rate": 0.12,
    "payment_type": "cash"
  }'
```

Response (abbreviated):
```json
{
  "current_annual_cost": 1800.00,
  "projected_25yr_utility_cost": 65432.10,
  "total_solar_cost": 20000.00,
  "total_solar_cost_after_itc": 14000.00,
  "total_25yr_savings": 125000.50,
  "monthly_savings_year1": 250.00,
  "payback_years": 5.6,
  "npv_25yr": 85000.00,
  "payment_type": "cash",
  "year_by_year_breakdown": [
    {
      "year": 1,
      "production_kwh": 12000.0,
      "utility_cost_avoided": 2160.0,
      "payment_or_cost": -6000.0,
      "maintenance_cost": 150.0,
      "net_cash_flow": 7810.0,
      "cumulative_savings": 7810.0
    }
    // ... 24 more years
  ]
}
```

### Proposal Generation
```bash
curl -X POST http://localhost:8000/api/v1/proposal-copy \
  -H "Content-Type: application/json" \
  -d '{
    "homeowner_name": "John Smith",
    "system_size_kw": 8.0,
    "monthly_savings": 120,
    "annual_production_kwh": 12000,
    "payback_years": 7.5,
    "npv_25yr": 65000,
    "payment_option": "finance",
    "monthly_payment": 150,
    "location": "San Francisco, CA",
    "utility_provider": "PG&E",
    "installation_count_local": 250,
    "installer_credentials": "NABCEP Certified, 20+ years"
  }'
```

Response:
```json
{
  "headline": "Your 8 kW Solar Solution",
  "subheadline": "Save $120/month in Year 1",
  "savings_narrative": "...",
  "payment_description": "...",
  "full_proposal": "..."
}
```

### Lead Scoring
```bash
curl -X POST http://localhost:8000/api/v1/lead-score \
  -H "Content-Type: application/json" \
  -d '{
    "source": "google",
    "bill_amount": 150,
    "address_state": "CA",
    "utility_provider": "PG&E",
    "has_bill_upload": true,
    "time_on_page": 180,
    "device_type": "desktop"
  }'
```

Response:
```json
{
  "score": 82.5,
  "confidence": 0.85,
  "recommendation": "hot",
  "factors": [
    {
      "name": "Lead source: google",
      "contribution": 7.0
    },
    {
      "name": "Monthly bill: $150",
      "contribution": 8.0
    },
    {
      "name": "Bill document uploaded",
      "contribution": 10.0
    }
  ]
}
```

### Lender Ranking
```bash
curl -X POST http://localhost:8000/api/v1/rank-lenders \
  -H "Content-Type: application/json" \
  -d '{
    "system_cost": 20000,
    "credit_tier": "good",
    "loan_amount": 20000,
    "state": "CA"
  }'
```

Response:
```json
{
  "recommended_lender": {
    "lender_name": "Lightreach",
    "apr": 0.0,
    "monthly_payment": 66.67,
    "term_years": 25,
    "approval_probability": 0.95,
    "rank_score": 98.5,
    "notes": "Sunbull partner - 0% APR promotional offer"
  },
  "all_options": [
    // ... other lenders ranked
  ]
}
```

## Configuration

### Environment Variables

```
# Application
ENVIRONMENT=production              # production or development
DEBUG=false                         # Enable debug mode
LOG_LEVEL=INFO                      # DEBUG, INFO, WARNING, ERROR

# OpenAI
OPENAI_API_KEY=sk-...              # Required for proposal generation
OPENAI_MODEL=gpt-4                 # Model to use

# Redis/Caching
REDIS_URL=redis://localhost:6379   # Redis connection
CACHE_TTL=86400                    # 24-hour cache TTL

# Models
MODEL_PATH=/app/models/trained     # Trained model location
USE_MODEL_CACHE=true               # Cache model results

# API
CORS_ORIGINS=["*"]                 # CORS allowed origins
```

## Monitoring & Logging

All logs are structured JSON output:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "log_level": "INFO",
  "logger": "app.routers.roi",
  "message": "ROI calculated",
  "system_size_kw": 8.0,
  "total_savings": 125000.50,
  "payback_years": 5.6
}
```

### Log Aggregation Setup

For production, forward logs to:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch
- Splunk
- Datadog

Configure with your log forwarding tool to ingest the JSON output.

## Performance Tuning

### Scale Horizontally
```bash
# Run multiple worker processes
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### Enable Caching
- Redis required for best performance
- Results cached for 24 hours
- Set `USE_MODEL_CACHE=true` in environment

### Model Loading
- Models pre-loaded on startup (see main.py lifespan)
- Fallback rules used if models unavailable
- No network requests for sizing/scoring/roi

## Troubleshooting

### Service won't start
```bash
# Check dependencies
pip install -r requirements.txt

# Check Python version (3.11+)
python --version

# Test imports
python -c "import app.main"
```

### Redis not connecting
```bash
# Check Redis running
redis-cli ping

# Check connection string
REDIS_URL=redis://localhost:6379
```

### OpenAI API errors
```bash
# Verify API key
echo $OPENAI_API_KEY

# Check API key valid: https://platform.openai.com/account/api-keys
# Service will fallback to rule-based proposal if API fails
```

### High latency
- Check Redis connection
- Monitor CPU/memory usage
- Consider adding more workers
- Check log for slow operations

## Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure valid `OPENAI_API_KEY`
- [ ] Setup Redis for caching
- [ ] Configure `CORS_ORIGINS` appropriately
- [ ] Setup log aggregation
- [ ] Configure monitoring/alerting
- [ ] Setup auto-scaling if needed
- [ ] Configure backup/disaster recovery
- [ ] Load test with expected traffic
- [ ] Setup CI/CD pipeline
- [ ] Document deployment runbook

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review logs in JSON format
3. Test endpoints with curl examples above
4. Check OpenAI API status if proposal generation fails
