import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Strings from "./Strings";

const Queries = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bigClients, setBigClients] = useState([]); // State for Big Clients data
  const [difficultClients, setDifficultClients] = useState([]); 
  const [prospectiveClients, setProspectiveClients] = useState([]); 

  const userId = localStorage.getItem("userId") || 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  useEffect(() => {
    // Fetch Big Clients Data
    fetch("http://localhost:5000/big_clients", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Big Clients Data:", data); // Debugging
        setBigClients(data); // Save data to state
      })
      .catch((err) => console.error("Error fetching big clients:", err));
  }, [token]);

  useEffect(() => {
    // Fetch Big Clients Data
    fetch("http://localhost:5000/difficult_clients", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Difficult Clients Data:", data); // Debugging
        setDifficultClients(data); // Save data to state
      })
      .catch((err) => console.error("Error fetching difficult clients:", err));
  }, [token]);

  useEffect(() => {
    // Fetch Prospective Clients Data
    fetch("http://localhost:5000/prospective_clients", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Prospective Clients Data:", data); // Debugging
        setProspectiveClients(data); // Save data to state
      })
      .catch((err) => console.error("Error fetching prospective clients:", err));
  }, [token]);


  const querySections = [
    {
      title: "BIG CLIENTS",
      columns: ["ID", "First Name", "Last Name", "Address", "Phone", "Email"],
      data: bigClients,
    },
    {
      title: "DIFFICULT CLIENTS",
      columns: ["ID", "First Name", "Last Name", "Address", "Phone", "Email"],
      data: difficultClients,
    },
    {
      title: "THIS MONTH QUOTES",
      columns: ["Column 1", "Column 2", "Column 3"],
    },
    {
      title: "PROSPECTIVE CLIENTS",
      columns: ["ID", "First Name", "Last Name", "Address", "Phone", "Email"],
      data: prospectiveClients,
    },
    {
      title: "LARGEST DRIVEWAY",
      columns: ["Column 1", "Column 2", "Column 3"],
    },
    {
      title: "OVERDUE BILLS",
      columns: ["Column 1", "Column 2", "Column 3"],
    },
    {
      title: "BAD CLIENTS",
      columns: ["ID", "First Name", "Last Name", "Address", "Phone", "Email"],
    },
    {
      title: "GOOD CLIENTS",
      columns: ["ID", "First Name", "Last Name", "Address", "Phone", "Email"],
    },
  ];

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
        {querySections.map((section, index) => (
          <QuerySection
            key={index}
            title={section.title}
            columns={section.columns}
            data={section.data || []} // Pass the data for each section
          />
        ))}
      </main>
    </div>
  );
};

const QuerySection = ({ title, columns, data }) => {
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
            {columns.map((column, index) => (
              <th key={index} style={{ padding: "12px", textAlign: "center" }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.client_id}</td>
                <td>{row.first_name}</td>
                <td>{row.last_name}</td>
                <td>{row.address}</td>
                <td>{row.phone}</td>
                <td>{row.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default Queries;
