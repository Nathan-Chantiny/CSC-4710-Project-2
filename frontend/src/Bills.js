import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Strings from "./Strings";

// Set the base URL for axios if not using a proxy
axios.defaults.baseURL = "http://localhost:5000";

const Bills = ({ user }) => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view bills.");
          return;
        }

        const response = await axios.get("/api/getBills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response (Bills):", response.data);
        setBills(response.data);
      } catch (err) {
        console.error("Error fetching bills:", err.response || err.message);
        setError(
          err.response?.data?.message || "Failed to load bills. Please try again."
        );
      }
    };

    fetchBills();
  }, []);

  const handleBillAction = async (action, billId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to perform this action.");
        return;
      }

      await axios.post(
        `/api/${action}/${billId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(
        `${action === "payBill" ? "Bill paid" : "Bill disputed"} successfully`
      );
      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.BillID === billId
            ? {
                ...bill,
                Status: action === "payBill" ? "Paid" : "Disputed",
              }
            : bill
        )
      );
    } catch (err) {
      console.error(`Error ${action} bill:`, err);
    }
  };

  return (
    <div
      className="bill-page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <main style={{ width: "100%", maxWidth: "800px" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "2rem",
            color: "#333",
          }}
        >
          Your Bills
        </h2>
        {error && (
          <p style={{ color: "red", marginBottom: "20px", textAlign: "center" }}>
            {error}
          </p>
        )}
        <table
          className="bill-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "0 auto",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "12px" }}>Bill ID</th>
              <th style={{ padding: "12px" }}>Order ID</th>
              <th style={{ padding: "12px" }}>Amount</th>
              <th style={{ padding: "12px" }}>Status</th>
              <th style={{ padding: "12px" }}>Note</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <tr
                  key={bill.BillID}
                  style={{
                    borderBottom: "1px solid #ddd",
                    textAlign: "left",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f1f1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={{ padding: "12px" }}>{bill.BillID}</td>
                  <td style={{ padding: "12px" }}>{bill.OrderID}</td>
                  <td style={{ padding: "12px" }}>
                    {bill.Amount && !isNaN(bill.Amount)
                      ? `$${Number(bill.Amount).toFixed(2)}`
                      : "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>{bill.Status || "Pending"}</td>
                  <td style={{ padding: "12px" }}>{bill.Note || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleBillAction("payBill", bill.BillID)}
                      style={{
                        padding: "6px 12px",
                        marginRight: "10px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Pay
                    </button>
                    <button
                      onClick={() => handleBillAction("disputeBill", bill.BillID)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Dispute
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !error && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "12px", textAlign: "center", color: "#777" }}
                  >
                    No bills available
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

const HomePage = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        <h1 style={{ fontSize: "2.5rem", color: "#333" }}>Bill Management</h1>
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

      <main>{token && <Bills user={{ userId: 1 }} />}</main>
    </div>
  );
};

export default HomePage;
