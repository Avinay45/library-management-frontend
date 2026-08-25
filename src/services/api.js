import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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
