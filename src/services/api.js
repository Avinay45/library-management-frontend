import axios from "axios";

const normalizeApiUrl = (value) => {
  return value?.trim().replace(/\/+$/, "");
};

const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

const API_BASE_URL =
  configuredApiUrl ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://library-management-backend-r45i.vercel.app/api");

if (!API_BASE_URL) {
  throw new Error("API configuration is missing. Set VITE_API_URL.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong",
) => {
  if (error?.response) {
    const { status, data } = error.response;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    switch (status) {
      case 400:
        return "Invalid request.";

      case 401:
        return "You are not authorized.";

      case 403:
        return "You do not have permission to perform this action.";

      case 404:
        return "Requested resource was not found.";

      case 409:
        return "This operation conflicts with existing data.";

      case 500:
        return "The server encountered an error.";

      case 503:
        return "The backend database is currently unavailable.";

      default:
        return `Request failed with status ${status}.`;
    }
  }

  if (error?.request) {
    return "Unable to reach the backend server. Please check the backend deployment and API URL.";
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Books                                                                      */
/* -------------------------------------------------------------------------- */

export const getBooks = async () => {
  const response = await api.get("/books");
  return response.data;
};

export const createBook = async (bookData) => {
  const response = await api.post("/books", bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

export const getMembers = async () => {
  const response = await api.get("/members");
  return response.data;
};

export const createMember = async (memberData) => {
  const response = await api.post("/members", memberData);
  return response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Transactions                                                               */
/* -------------------------------------------------------------------------- */

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post("/transactions/issue", transactionData);

  return response.data;
};

export const returnTransaction = async (id) => {
  const response = await api.put(`/transactions/${id}/return`);

  return response.data;
};

export const getOverdueTransactions = async () => {
  const response = await api.get("/transactions/overdue");
  return response.data;
};

export default api;
