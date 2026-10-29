export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: { message: 'Malformed JSON request body.' } });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: { message: 'Request body is too large.' } });
  if (err?.code === 11000) return res.status(409).json({ error: { message: 'A record with those details already exists.' } });
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ error: { message: 'Invalid data supplied.' } });
  }
  if (process.env.NODE_ENV !== 'production') console.error(err);
  return res.status(500).json({ error: { message: 'An unexpected server error occurred.' } });
}
