import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Overview of your library",
    },
    "/books": {
      title: "Books",
      subtitle: "Manage your library collection",
    },
    "/members": {
      title: "Members",
      subtitle: "Manage registered library members",
    },
    "/transactions": {
      title: "Transactions",
      subtitle: "Manage book borrowing and returns",
    },
  };

  const currentPage =
    pageTitles[location.pathname] || pageTitles["/dashboard"];

  return (
    <header className="app-header">
      <div className="header-title">
        <h2>{currentPage.title}</h2>
        <p>{currentPage.subtitle}</p>
      </div>

      <div className="header-actions">
        <button className="header-icon-button" type="button">
          🔔
        </button>

        <div className="profile">
          <div className="profile-avatar">A</div>

          <div className="profile-info">
            <strong>Administrator</strong>
            <span>Library Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;