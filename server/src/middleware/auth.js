export function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: { message: 'Please log in to continue.' } });
  req.userId = req.session.userId;
  next();
}
