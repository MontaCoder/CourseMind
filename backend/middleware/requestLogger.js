import morgan from 'morgan';

// Structured request logging middleware
// Logs method, URL, status, response time and a correlation id if provided
export const requestLogger = morgan((tokens, req, res) => {
  const correlationId = req.headers['x-request-id'] || '';
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length') || 0,
    responseTimeMs: Number(tokens['response-time'](req, res)),
    correlationId,
  });
});
