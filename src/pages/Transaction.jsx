import { useEffect, useState } from "react";
import {
  getBooks,
  getMembers,
  getTransactions,
  createTransaction,
  returnTransaction,
} from "../services/api";

function Transactions() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    book: "",
    member: "",
    dueDate: "",
  });

  // =========================
  // Load transaction data
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [booksResult, membersResult, transactionsResult] =
        await Promise.all([getBooks(), getMembers(), getTransactions()]);

      if (!booksResult.success) {
        throw new Error(booksResult.message || "Failed to load books");
      }

      if (!membersResult.success) {
        throw new Error(membersResult.message || "Failed to load members");
      }

      if (!transactionsResult.success) {
        throw new Error(
          transactionsResult.message || "Failed to load transactions",
        );
      }

      setBooks(booksResult.data || []);
      setMembers(membersResult.data || []);
      setTransactions(transactionsResult.data || []);
    } catch (err) {
      console.error("Transaction page loading error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load transaction data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // =========================
  // Form handling
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  // =========================
  // Issue book
  // =========================

  const handleIssue = async (event) => {
    event.preventDefault();

    if (!formData.book) {
      setFormError("Please select a book.");
      return;
    }

    if (!formData.member) {
      setFormError("Please select a member.");
      return;
    }

    if (!formData.dueDate) {
      setFormError("Please select a due date.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const result = await createTransaction({
        book: formData.book,
        member: formData.member,
        dueDate: formData.dueDate,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to issue book");
      }

      setFormData({
        book: "",
        member: "",
        dueDate: "",
      });

      await loadData();
    } catch (err) {
      console.error("Book issue error:", err);

      setFormError(
        err.response?.data?.message || err.message || "Unable to issue book.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Return book
  // =========================

  const handleReturn = async (transactionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this book as returned?",
    );

    if (!confirmed) return;

    try {
      const result = await returnTransaction(transactionId);

      if (!result.success) {
        throw new Error(result.message || "Failed to return book");
      }

      await loadData();
    } catch (err) {
      console.error("Book return error:", err);

      alert(
        err.response?.data?.message || err.message || "Unable to return book.",
      );
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <section className="transactions-page">
        <div className="page-heading">
          <div>
            <h1>Transactions</h1>
            <p>Issue and return library books.</p>
          </div>
        </div>

        <div className="page-loading">Loading transactions...</div>
      </section>
    );
  }

  // =========================
  // Error
  // =========================

  if (error) {
    return (
      <section className="transactions-page">
        <div className="page-heading">
          <div>
            <h1>Transactions</h1>
            <p>Issue and return library books.</p>
          </div>
        </div>

        <div className="page-error">{error}</div>
      </section>
    );
  }

  // =========================
  // Available books
  // =========================

  const availableBooks = books.filter(
    (book) => Number(book.availableQuantity) > 0,
  );

  return (
    <section className="transactions-page">
      {/* =========================
          Page heading
          ========================= */}

      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>Issue and return library books.</p>
        </div>
      </div>

      {/* =========================
          Issue Book
          ========================= */}

      <div className="transaction-card">
        <div className="transaction-card-heading">
          <div>
            <h2>Issue Book</h2>
            <p>Issue an available book to a library member.</p>
          </div>
        </div>

        <form className="transaction-form" onSubmit={handleIssue}>
          {formError && <div className="form-error">{formError}</div>}

          <div className="transaction-form-grid">
            <div className="form-field">
              <label htmlFor="book">Book</label>

              <select
                id="book"
                name="book"
                value={formData.book}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select a book</option>

                {availableBooks.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title} — {book.availableQuantity} available
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="member">Member</label>

              <select
                id="member"
                name="member"
                value={formData.member}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select a member</option>

                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="dueDate">Due Date</label>

              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="transaction-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={
                submitting ||
                availableBooks.length === 0 ||
                members.length === 0
              }
            >
              {submitting ? "Issuing..." : "Issue Book"}
            </button>
          </div>

          {availableBooks.length === 0 && (
            <p className="transaction-info">
              No books are currently available to issue.
            </p>
          )}

          {members.length === 0 && (
            <p className="transaction-info">
              Add a member before issuing a book.
            </p>
          )}
        </form>
      </div>

      {/* =========================
          Transaction History
          ========================= */}

      <div className="transaction-card">
        <div className="transaction-card-heading">
          <div>
            <h2>Transaction History</h2>
            <p>View current and previous book transactions.</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Issued books will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td data-label="Book">
                      {transaction.book?.title || "Unknown book"}
                    </td>

                    <td data-label="Member">
                      {transaction.member?.name || "Unknown member"}
                    </td>

                    <td data-label="Issue Date">
                      {transaction.issueDate
                        ? new Date(transaction.issueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td data-label="Due Date">
                      {transaction.dueDate
                        ? new Date(transaction.dueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td data-label="Return Date">
                      {transaction.returnDate
                        ? new Date(transaction.returnDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`transaction-status status-${transaction.status}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td data-label="Action" className="table-actions">
                      {transaction.status !== "returned" &&
                      transaction.returnDate === null ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleReturn(transaction._id)}
                        >
                          Return
                        </button>
                      ) : (
                        <span className="returned-label">Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Transactions;
