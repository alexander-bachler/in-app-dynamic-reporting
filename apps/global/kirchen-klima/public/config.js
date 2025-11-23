// Runtime configuration for production deployment
// In development, environment variables from .env are used instead
// This file is created by deployment process in production

// Only set window.env if it doesn't exist (to avoid overwriting in development)
if (typeof window !== 'undefined' && !window.env) {
    window.env = {
        REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL || 'https://api.linemetrics.com/v2'
    };
}
