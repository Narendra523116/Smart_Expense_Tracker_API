import rateLimit from 'express-rate-limit';


export const readLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15mins
  max: 100, // 100 reads in the 15mins window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// write limitter
export const writeLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1-minute window
  max: 10, // max 10 writes in the 1 min window
  message: {
    error: 'Too many write operations. Please wait a minute before trying again.'
  }
});