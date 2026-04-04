export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

export const success = <T>(
  data: T,
  statusCode: number = 200,
  message?: string
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

export const error = (
  errorMsg: string,
  statusCode: number = 500,
  data?: any
): ApiResponse => {
  return {
    success: false,
    error: errorMsg,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

export const paginated = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
): PaginatedResponse<T> => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    statusCode,
    timestamp: new Date().toISOString(),
  };
};
