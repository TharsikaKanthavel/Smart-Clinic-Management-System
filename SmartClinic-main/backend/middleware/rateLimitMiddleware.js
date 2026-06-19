function simpleRateLimiter(limit = 200, windowMs = 60000) {
  const map = new Map();
  return (req, res, next) => {
    const key = req.ip || 'ip';
    const now = Date.now();
    const state = map.get(key) || { count: 0, reset: now + windowMs };
    if (now > state.reset) { state.count = 0; state.reset = now + windowMs; }
    state.count += 1;
    map.set(key, state);
    if (state.count > limit) return res.status(429).json({ success: false, message: 'Too many requests' });
    next();
  };
}
module.exports = { simpleRateLimiter };
