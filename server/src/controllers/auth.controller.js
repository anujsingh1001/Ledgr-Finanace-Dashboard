import argon2 from 'argon2';
import User from '../models/User.js';
export async function register(req, res) {
  const { name, email, password } = req.validated.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: { message: 'An account with this email already exists.' } });
  const user = await User.create({ name, email, passwordHash: await argon2.hash(password, { type: argon2.argon2id }) });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: { message: 'Could not start a session.' } });
    req.session.userId = String(user._id);
    req.session.save(saveErr => {
      if (saveErr) return res.status(500).json({ error: { message: 'Could not save the session.' } });
      res.status(201).json({ data: { user: { id: String(user._id), name: user.name, email: user.email } } });
    });
  });
}
export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await argon2.verify(user.passwordHash, password))) return res.status(401).json({ error: { message: 'Email or password is incorrect.' } });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: { message: 'Could not start a session.' } });
    req.session.userId = String(user._id);
    req.session.save(saveErr => {
      if (saveErr) return res.status(500).json({ error: { message: 'Could not save the session.' } });
      res.json({ data: { user: { id: String(user._id), name: user.name, email: user.email } } });
    });
  });
}
export async function logout(req, res) {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: { message: 'Could not log out.' } });
    res.clearCookie('ledgr.sid');
    res.status(204).end();
  });
}
export async function me(req, res) {
  const user = await User.findById(req.userId).select('name email').lean();
  if (!user) return res.status(401).json({ error: { message: 'Session expired. Please log in again.' } });
  res.json({ data: { user: { id: String(user._id), name: user.name, email: user.email } } });
}
