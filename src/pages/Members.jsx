import { useEffect, useState } from "react";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  membershipDate: "",
};

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // Load members
  // =========================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMembers();

      if (!result.success) {
        throw new Error(result.message || "Failed to load members");
      }

      setMembers(result.data || []);
    } catch (err) {
      console.error("Members loading error:", err);

      setError(
        err.response?.data?.message || err.message || "Unable to load members.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadMembers, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // =========================
  // Modal helpers
  // =========================

  const openAddModal = () => {
    setEditingMember(null);
    setFormData(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);

    setFormData({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      membershipDate: member.membershipDate
        ? new Date(member.membershipDate).toISOString().split("T")[0]
        : "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingMember(null);
    setFormData(emptyForm);
    setFormError("");
  };

  // =========================
  // Form handling
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      return "Member name is required.";
    }

    if (!email) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!phone) {
      return "Phone number is required.";
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return "Please enter a valid phone number.";
    }

    if (!formData.membershipDate) {
      return "Membership date is required.";
    }

    return "";
  };

  // =========================
  // Add / Edit member
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        membershipDate: formData.membershipDate,
      };

      let result;

      if (editingMember) {
        result = await updateMember(editingMember._id, payload);
      } else {
        result = await createMember(payload);
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            `Failed to ${editingMember ? "update" : "create"} member`,
        );
      }

      closeModal();
      await loadMembers();
    } catch (err) {
      console.error("Member save error:", err);

      setFormError(
        err.response?.data?.message || err.message || "Unable to save member.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Delete member
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?",
    );

    if (!confirmed) return;

    try {
      const result = await deleteMember(id);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete member");
      }

      await loadMembers();
    } catch (err) {
      console.error("Member deletion error:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete member.",
      );
    }
  };

  // =========================
  // Loading state
  // =========================

  if (loading) {
    return (
      <section className="members-page">
        <div className="page-heading">
          <div>
            <h1>Members</h1>
            <p>Manage your library members.</p>
          </div>
        </div>

        <div className="page-loading">Loading members...</div>
      </section>
    );
  }

  // =========================
  // Error state
  // =========================

  if (error) {
    return (
      <section className="members-page">
        <div className="page-heading">
          <div>
            <h1>Members</h1>
            <p>Manage your library members.</p>
          </div>
        </div>

        <div className="page-error">{error}</div>
      </section>
    );
  }

  // =========================
  // Main UI
  // =========================

  return (
    <section className="members-page">
      <div className="page-heading">
        <div>
          <h1>Members</h1>
          <p>Manage your library members.</p>
        </div>

        <button type="button" className="primary-button" onClick={openAddModal}>
          + Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">♙</div>

          <h3>No members found</h3>

          <p>Add your first library member to get started.</p>

          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Member
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Membership Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td data-label="Name">{member.name}</td>

                  <td data-label="Email">{member.email}</td>

                  <td data-label="Phone">{member.phone}</td>

                  <td data-label="Membership Date">
                    {member.membershipDate
                      ? new Date(member.membershipDate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td data-label="Actions" className="table-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => openEditModal(member)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(member._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================
          Add / Edit Modal
          ========================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="member-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="member-modal-title">
                  {editingMember ? "Edit Member" : "Add Member"}
                </h2>

                <p>
                  {editingMember
                    ? "Update member information."
                    : "Add a new library member."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="member-form" onSubmit={handleSubmit}>
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-field">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter member name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="membershipDate">Membership Date</label>

                <input
                  id="membershipDate"
                  name="membershipDate"
                  type="date"
                  value={formData.membershipDate}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingMember
                      ? "Update Member"
                      : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Members;
