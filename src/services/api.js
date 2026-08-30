import axios from "axios";

const productionApiUrl = "https://library-management-backend-awrx-o9711azl6.vercel.app/api";

const getDefaultApiUrl = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".vercel.app")
  ) {
    return productionApiUrl;
  }

  return "http://localhost:5000/api";
};

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || getDefaultApiUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export const getApiErrorMessage = (error, fallback = "Unable to complete request.") => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || fallback;

    if (status === 404) {
      return "API endpoint was not found. Check the backend deployment URL.";
    }

    if (status >= 500) {
      return message;
    }

    return message;
  }

  if (error.request) {
    return `Backend is unavailable or blocked by CORS. API URL: ${apiBaseUrl}`;
  }

  return error.message || fallback;
};

// =========================
// Dashboard
// =========================

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

// =========================
// Books
// =========================

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

// =========================
// Members
// =========================

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
// =========================
// Transactions
// =========================

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
export default api;
