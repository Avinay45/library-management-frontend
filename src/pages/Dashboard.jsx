import { useEffect, useState } from "react";
import { getApiErrorMessage, getDashboardStats } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboardStats();

        if (!result.success) {
          throw new Error("Failed to load dashboard data");
        }

        setStats(result.data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(getApiErrorMessage(err, "Unable to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-heading">
          <h1>Dashboard</h1>
          <p>Overview of your library.</p>
        </div>

        <div className="dashboard-loading">Loading dashboard...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-heading">
          <h1>Dashboard</h1>
          <p>Overview of your library.</p>
        </div>

        <div className="dashboard-error">{error}</div>
      </section>
    );
  }

  const cards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      description: "Books in library",
      icon: "▣",
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      description: "Registered members",
      icon: "♙",
    },
    {
      title: "Active Loans",
      value: stats.activeLoans,
      description: "Currently borrowed",
      icon: "↔",
    },
    {
      title: "Returned Books",
      value: stats.returnedBooks,
      description: "Successfully returned",
      icon: "↩",
    },
    {
      title: "Overdue Loans",
      value: stats.overdueLoans,
      description: "Require attention",
      icon: "!",
    },
    {
      title: "Available Books",
      value: stats.availableBooks,
      description: "Ready to borrow",
      icon: "✓",
    },
    {
      title: "Borrowed Books",
      value: stats.borrowedBooks,
      description: "Currently unavailable",
      icon: "→",
    },
  ];

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your library.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.title}>
            <div className="stat-card-top">
              <div>
                <p className="stat-card-title">{card.title}</p>
                <h2>{card.value}</h2>
              </div>

              <div className="stat-card-icon">{card.icon}</div>
            </div>

            <p className="stat-card-description">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
