import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    nodeEnv: string;
    port: number;
    apiVersion: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    poolSize: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    magicLinkExpiresIn: string;
  };
  external: {
    googleSolarApiKey: string;
    nrelApiKey: string;
    openaiApiKey: string;
    sendgridApiKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;
  };
  lenders: {
    goodleap: {
      apiKey: string;
      partnerId: string;
    };
    mosaic: {
      apiKey: string;
    };
    sunlight: {
      apiKey: string;
    };
    lightreach: {
      apiKey: string;
    };
  };
  docusign: {
    integratorKey: string;
    username: string;
    password: string;
    accountId: string;
    baseUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  hubspot: {
    apiKey: string;
  };
  mlService: {
    url: string;
    apiKey: string;
  };
  auth0?: {
    domain: string;
    clientId: string;
    clientSecret: string;
  };
  email: {
    fromEmail: string;
    adminEmail: string;
  };
  logging: {
    level: string;
  };
  cors: {
    origin: string[];
  };
}

const config: Config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'sunbull_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sunbull_dev',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRY || '24h',
    magicLinkExpiresIn: process.env.MAGIC_LINK_EXPIRY || '15m',
  },
  external: {
    googleSolarApiKey: process.env.GOOGLE_SOLAR_API_KEY || '',
    nrelApiKey: process.env.NREL_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  lenders: {
    goodleap: {
      apiKey: process.env.GOODLEAP_API_KEY || '',
      partnerId: process.env.GOODLEAP_PARTNER_ID || '',
    },
    mosaic: {
      apiKey: process.env.MOSAIC_API_KEY || '',
    },
    sunlight: {
      apiKey: process.env.SUNLIGHT_API_KEY || '',
    },
    lightreach: {
      apiKey: process.env.LIGHTREACH_API_KEY || '',
    },
  },
  docusign: {
    integratorKey: process.env.DOCUSIGN_INTEGRATOR_KEY || '',
    username: process.env.DOCUSIGN_USERNAME || '',
    password: process.env.DOCUSIGN_PASSWORD || '',
    accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
    baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY || '',
  },
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    apiKey: process.env.ML_SERVICE_API_KEY || '',
  },
  auth0: process.env.AUTH0_DOMAIN ? {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  } : undefined,
  email: {
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@sunbull.ai',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@sunbull.ai',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(','),
  },
};

export default config;
