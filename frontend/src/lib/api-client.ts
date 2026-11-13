// frontend/src/lib/api-client.ts
// Thin re-export so feature modules can import from either path.

export {
    api,
    ApiError,
    getToken,
    setToken,
    formatMoney,
  } from "../api/client";