// Centralized API base URL resolution for frontend services
// Priority:
// 1) window.__API_BASE_URL__ (runtime-injected, e.g., via index.html or env.js)
// 2) import.meta.env.VITE_API_BASE_URL (build-time Vite env)
// 3) fallback to http://localhost:3000/api for local dev

export const API_BASE_URL =
  (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3000/api';


