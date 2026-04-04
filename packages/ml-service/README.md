# Sunbull AI ML Service

Production-ready FastAPI service for machine learning and AI operations in the Sunbull solar sales platform.

## Features

- **System Sizing**: XGBoost-powered solar system recommendations with confidence scoring
- **ROI Analysis**: Complete 25-year NPV financial modeling with year-by-year cash flows
- **Proposal Generation**: GPT-4 powered personalized proposal copy writing
- **Lead Scoring**: Logistic regression lead propensity scoring with heuristic fallback
- **Lender Ranking**: Algorithm-based ranking of financing options

## Architecture

```
app/
├── main.py                 # FastAPI application, middleware, lifespan events
├── config.py               # Settings and environment configuration
├── models/                 # ML/AI models
│   ├── sizing_model.py     # XGBoost system sizing with rule-based fallback
│   ├── roi_calculator.py   # 25-year NPV financial modeling
│   ├── proposal_writer.py  # GPT-4 proposal copy generation
│   ├── lead_scorer.py      # Lead propensity scoring
│   └── lender_ranker.py    # Lender option ranking
├── routers/                # API endpoints
│   ├── sizing.py           # POST /api/v1/sizing
│   ├── roi.py              # POST /api/v1/roi
│   ├── proposal.py         # POST /api/v1/proposal-copy
│   ├── scoring.py          # POST /api/v1/lead-score
│   └── lender.py           # POST /api/v1/rank-lenders
└── utils/                  # Utilities
    ├── cache.py            # Redis caching with TTL
    └── logging.py          # Structured logging with structlog
```

## Quick Start

### 1. Setup Environment

```bash
# Copy example environment
cp .env.example .env

# Edit .env with your configuration
# - Set OPENAI_API_KEY for proposal generation
# - Configure REDIS_URL if using caching
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Service

```bash
# Development with auto-reload
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Docker Deployment

```bash
# Build image
docker build -t sunbull-ml-service:latest .

# Run container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -e REDIS_URL=redis://redis:6379 \
  sunbull-ml-service:latest
```

## API Endpoints

### Health Check
```bash
GET /health
```

### System Sizing
```bash
POST /api/v1/sizing
{
  "roof_area": 2500,
  "usable_solar_area": 2000,
  "monthly_kwh": 800,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "azimuth": 180,
  "pitch": 25,
  "shading_factor": 0.85
}
```

### ROI Analysis (25-Year)
```bash
POST /api/v1/roi
{
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
}
```

### Proposal Generation
```bash
POST /api/v1/proposal-copy
{
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
  "installer_credentials": "NABCEP Certified"
}
```

### Lead Scoring
```bash
POST /api/v1/lead-score
{
  "source": "google",
  "bill_amount": 150,
  "address_state": "CA",
  "utility_provider": "PG&E",
  "has_bill_upload": true,
  "time_on_page": 180,
  "device_type": "desktop"
}
```

### Lender Ranking
```bash
POST /api/v1/rank-lenders
{
  "system_cost": 20000,
  "credit_tier": "good",
  "loan_amount": 20000,
  "state": "CA"
}
```

## Key Features

### System Sizing
- **XGBoost Model**: Trained on historical sizing data for best accuracy
- **Rule-Based Fallback**: Geometric solar calculation when model unavailable
- **Confidence Scoring**: Indicates prediction confidence based on inputs
- **Shading Analysis**: Accounts for orientation and shading factors

### ROI Calculator
- **25-Year Analysis**: Complete financial modeling over system lifetime
- **NEM 3.0 Support**: California utility net metering handling
- **Panel Degradation**: 0.55% annual efficiency loss
- **Cash Flow Breakdown**: Year-by-year savings and payback analysis
- **NPV Calculation**: Discount rate adjusted net present value

### Proposal Writer
- **GPT-4 Powered**: Personalized, honest copy generation
- **Zero Sales Pressure**: Data-driven messaging focused on facts
- **Local Trust Elements**: Installer credentials and local installation count
- **Fallback Mode**: Rule-based generation if OpenAI unavailable

### Lead Scoring
- **Logistic Regression**: Trained model for high accuracy
- **Heuristic Fallback**: When model not available
- **Factor Attribution**: Explains which factors drive the score
- **Recommendation Tiers**: Hot, warm, cool categorization

### Lender Ranking
- **Multi-Factor Scoring**: APR (40%), approval probability (30%), payment (30%)
- **State-Aware Rates**: Regional APR adjustments
- **Credit Tier Mapping**: Approval probability by credit quality
- **Weighted Composite**: Balanced scoring across metrics

## Configuration

### Environment Variables

- `ENVIRONMENT`: `production` or `development`
- `DEBUG`: Enable debug mode (true/false)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `OPENAI_API_KEY`: OpenAI API key for proposal generation
- `REDIS_URL`: Redis connection URL for caching
- `MODEL_PATH`: Path to trained model files
- `CORS_ORIGINS`: Allowed CORS origins (JSON array)

### Redis Caching

Results are cached with 24-hour TTL:
- System sizing calculations (by address hash)
- Financial calculations
- Lead scores

Set `USE_MODEL_CACHE=false` to disable caching.

## Structured Logging

All logs are output in JSON format with structured fields:
- Timestamp (ISO 8601)
- Log level
- Logger name
- Custom fields (e.g., system_size_kw, score, error)

Example:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "log_level": "INFO",
  "logger": "app.routers.sizing",
  "message": "Sizing calculated",
  "kw": 8.0,
  "panels": 19,
  "offset": 98.5
}
```

## Performance Considerations

- **Caching**: Redis caching for repeating calculations
- **Model Loading**: Models pre-loaded on startup
- **Async**: FastAPI async for high concurrency
- **Fallbacks**: Rule-based fallback modes for all models
- **Proposal Generation**: 3-8 second expected response time

## Security

- CORS middleware with configurable origins
- Environment-based configuration (no secrets in code)
- Input validation using Pydantic models
- Structured error handling and logging

## Development

### Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/
```

### Model Training

Place training data in `models/training/` and run:

```python
from app.models.sizing_model import sizing_model

# Train with historical data
X, y = load_your_data()  # Your data loading
sizing_model.train(X, y)
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `OPENAI_API_KEY`
- [ ] Setup Redis for caching
- [ ] Configure CORS origins
- [ ] Setup structured logging aggregation
- [ ] Enable monitoring and alerting
- [ ] Configure log rotation

### Docker Compose

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
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## License

Proprietary - Sunbull AI
