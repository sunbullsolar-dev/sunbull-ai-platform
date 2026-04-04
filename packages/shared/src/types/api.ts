export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}

export interface GoogleSolarResponse {
  configUrl: string;
  solarPotential: {
    latitudeDegrees: number;
    longitudeDegrees: number;
    radiusMeters: number;
    panelsCount: number;
    panelAreaSquareMeters: number;
    solarPotentialPercent: number;
    yearlyEnergyDcKwh: number;
  };
  roofSegments: Array<{
    id: string;
    center: {
      latitude: number;
      longitude: number;
    };
    boundingBox: Array<{
      latitude: number;
      longitude: number;
    }>;
    planeHeightAtCenterMeters: number;
    azimuthDegrees: number;
    tiltDegrees: number;
    areaSquareMeters: number;
    sunshadeHours: number;
  }>;
}

export interface PVWattsResponse {
  version: string;
  ssc_version: string;
  station_info: {
    location: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
  };
  inputs: {
    system_capacity: number;
    derate: number;
    ac_losses: number;
    dc_losses: number;
    losses: number;
  };
  outputs: {
    ac_monthly: number[];
    ac_annual: number;
    solrad_monthly: number[];
    solrad_annual: number;
    poa_monthly: number[];
    poa_annual: number;
  };
}

export interface OpenEIRateResponse {
  utility: string;
  utility_code: string;
  utility_name: string;
  residential: Array<{
    name: string;
    energycharge: number;
    fixedmonthlycharge?: number;
    peakkwhusage?: number;
  }>;
}

export interface LenderPreQualResponse {
  lenderId: string;
  lenderName: string;
  preQualified: boolean;
  qualificationScore?: number;
  estimatedApr?: number;
  estimatedLoanAmount?: number;
  loanTermOptions?: number[];
  monthlyPaymentEstimates?: Record<number, number>;
  qualificationMessage: string;
  expiresAt: Date;
}
