import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBook,
  deleteBook,
  getBooks,
  updateBook,
} from "../services/api";

const emptyForm = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  quantity: "",
};

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(" ");
  }

  return data?.message || fallback;
};

function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const borrowedCopies = useMemo(() => {
    if (!editingBook) {
      return 0;
    }

    return editingBook.quantity - editingBook.availableQuantity;
  }, [editingBook]);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getBooks();

      if (!result.success) {
        throw new Error("Failed to load books");
      }

      setBooks(result.data);
    } catch (err) {
      console.error("Books loading error:", err);
      setError("Unable to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBooks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadBooks]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFormError("");
    setSuccess("");
  };

  const validateForm = () => {
    const requiredFields = ["title", "author", "category", "isbn"];

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        return "Please complete all book details.";
      }
    }

    if (form.quantity === "") {
      return "Please enter a quantity.";
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      return "Quantity must be a whole number greater than or equal to 0.";
    }

    if (editingBook && quantity < borrowedCopies) {
      return `Quantity cannot be less than ${borrowedCopies} because that many copies are currently borrowed.`;
    }

    return "";
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingBook(null);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      quantity: Number(form.quantity),
    };

    try {
      setSaving(true);
      setFormError("");
      setSuccess("");

      const result = editingBook
        ? await updateBook(editingBook._id, payload)
        : await createBook(payload);

      if (!result.success) {
        throw new Error("Failed to save book");
      }

      await loadBooks();
      resetForm();
      setSuccess(
        editingBook
          ? "Book updated successfully."
          : "Book added successfully.",
      );
    } catch (err) {
      console.error("Book save error:", err);
      setFormError(getErrorMessage(err, "Unable to save book."));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (book) => {
    setEditingBook(book);
    setBookToDelete(null);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      quantity: String(book.quantity),
    });
    setFormError("");
    setSuccess("");
  };

  const confirmDelete = async () => {
    if (!bookToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const result = await deleteBook(bookToDelete._id);

      if (!result.success) {
        throw new Error("Failed to delete book");
      }

      await loadBooks();

      if (editingBook?._id === bookToDelete._id) {
        resetForm();
      }

      setBookToDelete(null);
      setSuccess("Book deleted successfully.");
    } catch (err) {
      console.error("Book delete error:", err);
      setError(getErrorMessage(err, "Unable to delete book."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="books-page">
      <div className="dashboard-heading">
        <div>
          <h1>Books</h1>
          <p>Manage library books.</p>
        </div>
      </div>

      {success && <div className="books-alert books-alert-success">{success}</div>}
      {error && <div className="books-alert books-alert-error">{error}</div>}

      <div className="books-layout">
        <section className="books-panel">
          <div className="books-panel-heading">
            <h2>{editingBook ? "Edit Book" : "Add Book"}</h2>
          </div>

          <form className="book-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label>
              <span>Author</span>
              <input
                name="author"
                type="text"
                value={form.author}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label>
              <span>Category</span>
              <input
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label>
              <span>ISBN</span>
              <input
                name="isbn"
                type="text"
                value={form.isbn}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label>
              <span>Quantity</span>
              <input
                name="quantity"
                type="number"
                min={editingBook ? borrowedCopies : 0}
                step="1"
                value={form.quantity}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            {editingBook && (
              <div className="inventory-note">
                <span>Borrowed copies</span>
                <strong>{borrowedCopies}</strong>
              </div>
            )}

            {formError && (
              <div className="books-alert books-alert-error">{formError}</div>
            )}

            <div className="book-form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
              </button>

              {editingBook && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="books-panel books-list-panel">
          <div className="books-panel-heading">
            <h2>Book List</h2>
            <span>{books.length} total</span>
          </div>

          {loading ? (
            <div className="books-empty">Loading books...</div>
          ) : books.length === 0 ? (
            <div className="books-empty">No books have been added yet.</div>
          ) : (
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th>Quantity</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>{book.isbn}</td>
                      <td>{book.quantity}</td>
                      <td>{book.availableQuantity}</td>
                      <td>
                        <div className="book-row-actions">
                          <button
                            className="table-button"
                            type="button"
                            onClick={() => startEdit(book)}
                          >
                            Edit
                          </button>
                          <button
                            className="table-button danger"
                            type="button"
                            onClick={() => setBookToDelete(book)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {bookToDelete && (
        <div className="modal-backdrop" role="presentation">
          <div className="confirm-dialog" role="dialog" aria-modal="true">
            <h2>Delete Book</h2>
            <p>
              Delete <strong>{bookToDelete.title}</strong> from the library?
            </p>

            <div className="confirm-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setBookToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Books;
