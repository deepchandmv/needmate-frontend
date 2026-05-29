// API base URL — loaded from environment variables
// .env           → http://localhost:3000  (local dev)
// .env.production → empty string          (Vercel, same-domain relative paths)
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
