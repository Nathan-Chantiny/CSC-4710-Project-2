import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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

  const endpoints = useMemo(() => [
  { title: "BIG CLIENTS", url: "/big_clients" },
  { title: "DIFFICULT CLIENTS", url: "/difficult_clients" },
  { title: "THIS MONTH QUOTES", url: "/this_month_quotes" },
  { title: "PROSPECTIVE CLIENTS", url: "/prospective_clients" },
  { title: "LARGEST DRIVEWAY", url: "/largest_driveway" },
  { title: "OVERDUE BILLS", url: "/overdue_bills" },
  { title: "BAD CLIENTS", url: "/bad_clients" },
  { title: "GOOD CLIENTS", url: "/good_clients" },
], []);

  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = {};
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint.url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchedData[endpoint.title] = response.data;
        } catch (error) {
          console.error(`Error fetching data for ${endpoint.title}:`, error);
          fetchedData[endpoint.title] = [];
        }
      }
      setData(fetchedData);
    };

    if (token) {
      fetchData();
    }
  }, [token, endpoints]);

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
                    to="/bills"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                      color: "#007bff",
                    }}
                  >
                    {Strings.billsName}
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
        {endpoints.map(({ title }) => (
          <QuerySection key={title} title={title} data={data[title] || []} />
        ))}
      </main>
    </div>
  );
};

const QuerySection = ({ title, data }) => {
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
          width: "95%",
          maxWidth: "1200px",
          margin: "0 auto",
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
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => (
                <th key={key} style={{ padding: "12px", textAlign: "center" }}>
                  {key.toUpperCase()}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
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
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((value, cellIdx) => (
                  <td
                    key={cellIdx}
                    style={{ padding: "12px", textAlign: "center" }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default Queries;