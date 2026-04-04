import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { error as errorResponse } from '../utils/apiResponse';

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';

  logger.error('Request error', {
    method: req.method,
    path: req.path,
    statusCode,
    error: errorMessage,
    stack: err.stack,
    details: err.details,
  });

  res.status(statusCode).json(
    errorResponse(errorMessage, statusCode, err.details)
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
  });

  res.status(404).json(
    errorResponse(`Route ${req.path} not found`, 404)
  );
};
