export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://air-invoice-server.vercel.app");
