// Central configuration for frontend API endpoints
// In production, Vite will read VITE_API_URL from environment variables.
// In development, it defaults to the local server on port 5000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
