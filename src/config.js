// API base URL - uses environment variable in production, falls back to localhost for dev
// On Vercel: VITE_API_URL is empty, so API calls use relative paths (same domain)
// On local dev: falls back to http://localhost:3000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE;
