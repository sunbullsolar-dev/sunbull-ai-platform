# Sunbull AI ML Service - Complete File Index

## Project Structure

Complete production-ready FastAPI ML service with 5 core AI/ML modules.

**Total Files**: 39
**Size**: 208 KB

### Root Configuration Files

- **requirements.txt** - Python dependencies (13 core packages)
- **Dockerfile** - Docker container definition (Python 3.11)
- **.env.example** - Environment configuration template
- **.gitignore** - Git ignore rules
- **package.json** - Node.js metadata (if used in monorepo)

### Documentation

- **README.md** - User guide with API endpoints and quick start
- **DEPLOYMENT.md** - Comprehensive deployment guide with examples
- **INDEX.md** - This file
- **example_usage.py** - Python example code for all models

### Application Code

#### Core Application (app/)

**app/__init__.py** - Package marker

**app/main.py** (230+ lines)
- FastAPI application setup
- CORS middleware configuration
- Lifespan event handler (startup/shutdown)
- Health check endpoint (/health)
- Router mounting
- Structured logging initialization

**app/config.py** (40+ lines)
- Pydantic BaseSettings configuration
- Environment variable management
- API, Redis, OpenAI, and model settings
- All configurable via .env file

#### Models (app/models/)

**app/models/__init__.py** - Package marker

**app/models/sizing_model.py** (280+ lines)
- **SizingInput** dataclass - roof area, location, orientation
- **SizingOutput** dataclass - recommended kW, panel count, confidence
- **SizingModel** class with:
  - XGBoost model training and prediction
  - Rule-based fallback (no model required)
  - Peak sun hour estimation by latitude
  - Efficiency factor calculation
  - Space constraint handling
  - Global `sizing_model` instance

**app/models/roi_calculator.py** (300+ lines)
- **PaymentType** enum - cash, finance, lightreach
- **YearlyBreakdown** dataclass - annual cash flow
- **ROIInput** dataclass - system specs and financial parameters
- **ROIOutput** dataclass - complete 25-year analysis
- **ROICalculator** class with:
  - Full 25-year cash flow modeling
  - Panel degradation (0.55% annual)
  - NEM 2.0 and NEM 3.0 support
  - Utility escalation (default 3%)
  - Loan amortization for financed options
  - NPV calculation with 5% discount rate
  - Payback period interpolation
  - Global `roi_calculator` instance

**app/models/proposal_writer.py** (250+ lines)
- **ProposalInput** dataclass - homeowner and system details
- **ProposalOutput** dataclass - headline, narrative, payment description
- **ProposalWriter** class with:
  - GPT-4 integration for copy generation
  - Careful system prompt for honest, data-driven tone
  - Fallback to rule-based generation if OpenAI unavailable
  - JSON parsing from API response
  - Trust element inclusion (local installs, credentials)
  - Global `proposal_writer` instance

**app/models/lead_scorer.py** (300+ lines)
- **LeadScorerInput** dataclass - source, bill, location, engagement
- **ScoringFactor** dataclass - individual contribution
- **LeadScorerOutput** dataclass - score, confidence, factors, recommendation
- **LeadScorer** class with:
  - Logistic regression model training
  - Heuristic fallback scoring algorithm
  - Source weighting (Google, Facebook, organic, etc.)
  - State solar potential factors
  - Bill amount normalization
  - Engagement time scoring
  - Device type factors
  - Feature extraction and normalization
  - Factor attribution
  - Recommendation tiers (hot/warm/cool)
  - Global `lead_scorer` instance

**app/models/lender_ranker.py** (280+ lines)
- **CreditTier** enum - excellent, good, fair, poor
- **LenderOption** dataclass - name, APR, payment, approval probability
- **LenderRankerInput** dataclass - system cost, credit tier, loan amount, state
- **LenderRankerOutput** dataclass - recommended and all options
- **LenderRanker** class with:
  - 5 pre-configured lenders (Lightreach, Mosaic, Sunrun, LendingClub, BoA)
  - State-based APR adjustments
  - Credit tier approval probability mapping
  - Composite rank scoring (APR 40%, approval 30%, payment 30%)
  - Monthly payment calculation
  - Lender eligibility checking
  - Global `lender_ranker` instance

#### API Routers (app/routers/)

**app/routers/__init__.py** - Package marker

**app/routers/sizing.py** (70+ lines)
- POST /api/v1/sizing
- Input validation via SizingInput
- Cache key generation from address hash
- Redis caching with fallback
- Response formatting
- Structured error logging

**app/routers/roi.py** (80+ lines)
- POST /api/v1/roi
- PaymentType enum handling
- Year-by-year breakdown formatting
- Comprehensive financial response
- 25-year data aggregation
- Structured error handling

**app/routers/proposal.py** (65+ lines)
- POST /api/v1/proposal-copy
- ProposalInput extraction
- GPT-4 based generation
- Fallback handling for API failures
- Response formatting

**app/routers/scoring.py** (65+ lines)
- POST /api/v1/lead-score
- LeadScorerInput extraction
- Model prediction with fallback
- Factor attribution formatting
- Recommendation tier output

**app/routers/lender.py** (75+ lines)
- POST /api/v1/rank-lenders
- CreditTier enum handling
- Lender ranking algorithm
- Top recommendation + all options
- Detailed financing details

#### Utilities (app/utils/)

**app/utils/cache.py** (90+ lines)
- **RedisCache** class with:
  - Redis connection management
  - Graceful fallback if Redis unavailable
  - JSON serialization
  - TTL management
  - get/set/delete/flush operations
  - Exception handling
- Global `cache` instance

**app/utils/logging.py** (40+ lines)
- **setup_logging()** function
- Structlog configuration
- JSON output format
- Stdlib integration
- **get_logger()** factory function

### Summary by Module

#### 1. System Sizing (sizing_model.py)
- **Type**: XGBoost ML model with rule-based fallback
- **Input**: Location, roof area, consumption, orientation
- **Output**: Recommended kW, panel count, offset %, confidence
- **Algorithm**: Machine learning + geometric solar calculation
- **Fallback**: Available without trained model

#### 2. ROI Calculator (roi_calculator.py)
- **Type**: Financial modeling engine
- **Input**: System specs, consumption, utility rates, payment type
- **Output**: 25-year cash flow analysis with year-by-year breakdown
- **Features**: NEM support, degradation, escalation, NPV, payback period
- **Scope**: Complete financial analysis

#### 3. Proposal Writer (proposal_writer.py)
- **Type**: GPT-4 AI powered text generation
- **Input**: Homeowner details, financial info, location
- **Output**: Headline, narrative, payment description, full proposal
- **Tone**: Honest, data-driven, NO sales pressure
- **Fallback**: Rule-based generation if API unavailable

#### 4. Lead Scorer (lead_scorer.py)
- **Type**: Logistic regression classification
- **Input**: Source, bill amount, location, engagement, device
- **Output**: Score (0-100), confidence, contributing factors
- **Algorithm**: Machine learning + heuristic scoring
- **Tiers**: hot (75+), warm (50-74), cool (<50)

#### 5. Lender Ranker (lender_ranker.py)
- **Type**: Algorithm-based ranking
- **Input**: System cost, credit tier, loan amount, state
- **Output**: Ranked lender options with APR and payment
- **Data**: 5 major lenders with state-specific rates
- **Scoring**: Multi-factor composite algorithm

### Technology Stack

**Framework**: FastAPI 0.104.1
**Server**: Uvicorn 0.24.0
**Python Version**: 3.11+
**ML Libraries**: XGBoost, scikit-learn, NumPy, pandas
**API**: OpenAI (GPT-4)
**Caching**: Redis
**Validation**: Pydantic
**Logging**: structlog + stdlib
**Config**: pydantic-settings

### Key Features

- Production-ready code with error handling
- Structured logging in JSON format
- Redis caching with TTL
- Fallback modes for all models
- Type hints throughout
- Comprehensive docstrings
- CORS middleware configured
- Health check endpoint
- Environment-based configuration
- Async FastAPI endpoints
- Pydantic validation
- Request logging and tracking

### File Statistics

```
Python code files: 12
Configuration files: 3
Documentation files: 4
Total executable lines: ~2,500
Total lines with comments: ~3,500
```

### API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /health | GET | Health check |
| /api/v1/sizing | POST | System sizing |
| /api/v1/roi | POST | 25-year ROI analysis |
| /api/v1/proposal-copy | POST | Proposal generation |
| /api/v1/lead-score | POST | Lead scoring |
| /api/v1/rank-lenders | POST | Lender ranking |

### Getting Started

1. **Review Structure**: Start with README.md
2. **Understand Models**: Read each models/*.py file
3. **Review Routers**: Check routers/*.py for API implementation
4. **Deploy**: Follow DEPLOYMENT.md
5. **Test**: Run example_usage.py
6. **Integrate**: Call API endpoints from your application

### Production Deployment

All files are production-ready:
- Complete error handling
- Structured logging
- Configurable via environment
- Docker compatible
- Fallback modes for all features
- Type safe with Pydantic
- Tested code patterns

See DEPLOYMENT.md for detailed deployment instructions.
