/**
 * logger.js
 *
 * Centralized logging & error capture utility for TopLight Backend.
 * Captures comprehensive stack traces, request context (route, method, compcode, idcard),
 * and standardizes error diagnostics across all service endpoints.
 */

/**
 * Format and log an error with full stack trace, timestamp, and request context.
 *
 * @param {string} context - The service, function, or controller name (e.g. 'LeaveService:getDocId')
 * @param {Error|any} error - The caught error object
 * @param {import('express').Request} [req] - Optional Express request for contextual diagnostics
 */
export function logServiceError(context, error, req) {
  const timestamp = new Date().toISOString();
  const message = error?.message || String(error);
  const stack = error?.stack || 'No stack trace available';

  const method = req?.method || 'N/A';
  const url = req?.originalUrl || req?.url || 'N/A';
  const compCode =
    req?.headers?.compcode ||
    req?.headers?.Compcode ||
    req?.query?.compCode ||
    req?.body?.compcode ||
    'N/A';
  const idCard =
    req?.headers?.idcard ||
    req?.headers?.Idcard ||
    req?.body?.idcard ||
    req?.body?.idCard ||
    'N/A';
  const ip = req?.ip || req?.socket?.remoteAddress || 'N/A';

  const separator = '─'.repeat(75);

  console.error(`\n┌${separator}`);
  console.error(`│ [ERROR] ${timestamp} | Context: ${context || 'UnknownService'}`);
  console.error(`│ Request: ${method} ${url} | Client IP: ${ip}`);
  console.error(`│ Session Identity: IdCard: ${idCard} | CompCode: ${compCode}`);
  console.error(`│ Error Message: ${message}`);
  console.error(`├${separator}`);
  console.error(`│ Stack Trace:`);
  const stackLines = stack.split('\n');
  for (const line of stackLines) {
    console.error(`│   ${line}`);
  }
  console.error(`└${separator}\n`);
}

/**
 * Common handler for service catch blocks.
 * Logs full stack trace and dispatches a safe JSON error response.
 *
 * @param {Object} options
 * @param {import('express').Response} options.res - Express response
 * @param {import('express').Request} [options.req] - Express request
 * @param {Error|any} options.error - Caught error
 * @param {string} options.context - Identifying context (e.g. 'UserService:login')
 * @param {number} [options.statusCode=500] - HTTP status code
 * @param {number} [options.customStatus] - Domain status indicator (e.g. status: 0)
 * @param {string} [options.message] - Client-facing message
 * @param {any} [options.data] - Fallback data (e.g. [] or {})
 */
export function handleServiceError({
  res,
  req,
  error,
  context = 'ServiceError',
  statusCode = 500,
  customStatus,
  message,
  data,
}) {
  logServiceError(context, error, req);

  if (!res || res.headersSent) {
    return;
  }

  const clientMessage = message || error?.message || 'Internal Server Error';

  const responsePayload = {};
  if (customStatus !== undefined) {
    responsePayload.status = customStatus;
  }
  responsePayload.error = clientMessage;
  responsePayload.message = clientMessage;

  if (data !== undefined) {
    responsePayload.data = data;
  }

  if (customStatus === undefined && responsePayload.statusCode === undefined) {
    responsePayload.statusCode = 1;
  }

  return res.status(statusCode).json(responsePayload);
}

/**
 * Higher-order wrapper to automatically catch async errors in route handlers.
 *
 * @param {Function} fn - Async express route function
 * @param {string} [context] - Context label
 */
export function catchAsync(fn, context) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      handleServiceError({
        res,
        req,
        error: err,
        context: context || fn.name || 'AsyncHandler',
      });
    });
  };
}

export default {
  logServiceError,
  handleServiceError,
  catchAsync,
};

