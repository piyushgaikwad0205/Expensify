export const chaosMiddleware = (req, res, next) => {
  const isEnabled = process.env.ENABLE_CHAOS === 'true' || req.headers['x-chaos'] === 'true';
  if (!isEnabled) {
    return next();
  }

  const delayMs = Number(req.headers['x-chaos-delay']) || Number(process.env.CHAOS_DELAY_MS) || 0;
  const failureRate = Number(req.headers['x-chaos-rate']) || Number(process.env.CHAOS_FAILURE_RATE) || 0;

  const shouldFail = Math.random() < failureRate;

  setTimeout(() => {
    if (shouldFail) {
      return res.status(503).json({
        success: false,
        message: 'Simulated service degradation / database timeout',
        
      });
    }
    next();
  }, delayMs);
};
