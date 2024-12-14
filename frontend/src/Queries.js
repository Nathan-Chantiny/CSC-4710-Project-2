import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Strings from "./Strings";

const Queries = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId") || 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#333" }}>Query Management</h1>
        <nav style={{ marginTop: "20px" }}>
          <ul
            style={{
              listStyleType: "none",
              padding: "0",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {!token ? (
              <>
                <li>
                  <Link
                    to="/login"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.loginName}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.registerName}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.homePageName}
                  </Link>
                </li>
                {userId !== 0 && (
                  <li>
                    <Link
                      to="/quote"
                      style={{
                        textDecoration: "none",
                        fontSize: "1.2rem",
                        color: "#007bff",
                      }}
                    >
                      {Strings.submitQuoteName}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/profile"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.quoteName}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.ordersName}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/queries"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.queriesName}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.logoutName}
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main style={{ width: "100%", maxWidth: "1200px" }}>
        <QuerySection title="BIG CLIENTS" />
        <QuerySection title="DIFFICULT CLIENTS" />
        <QuerySection title="THIS MONTH QUOTES" />
        <QuerySection title="PROSPECTIVE CLIENTS" />
        <QuerySection title="LARGEST DRIVEWAY" />
        <QuerySection title="OVERDUE BILLS" />
        <QuerySection title="BAD CLIENTS" />
        <QuerySection title="GOOD CLIENTS" />
      </main>
    </div>
  );
};

const QuerySection = ({ title }) => {
    return (
      <section style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "1.8rem",
            color: "#333",
          }}
        >
          {title}
        </h2>
        <table
          style={{
            width: "95%", // Stretch across most of the page width
            maxWidth: "1200px", // Restrict maximum width
            margin: "0 auto", // Center the table horizontally
            borderCollapse: "collapse",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <th style={{ padding: "12px", textAlign: "center" }}>Column 1</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Column 2</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Column 3</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Column 4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="4"
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  };
  
  

export default Queries;
