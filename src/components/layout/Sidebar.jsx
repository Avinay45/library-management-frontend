import { NavLink } from "react-router-dom";

function Sidebar() {
  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Books",
      path: "/books",
      icon: "▣",
    },
    {
      label: "Members",
      path: "/members",
      icon: "♙",
    },
    {
      label: "Transactions",
      path: "/transactions",
      icon: "↔",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">L</div>

        <div>
          <h1>Library</h1>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">MENU</p>

        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />

          <div>
            <strong>System Online</strong>
            <span>All services operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
