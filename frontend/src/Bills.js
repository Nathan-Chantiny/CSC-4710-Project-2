import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

axios.defaults.baseURL = "http://localhost:5000";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view bills.");
          return;
        }

        const decoded = jwtDecode(token);
        const currentUserId = decoded.userId;
        setUserId(currentUserId);

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
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to perform this action.");
      return;
    }

    // If paying the bill, confirm first
    if (action === "payBill") {
      const confirmPayment = window.confirm(
        "Are you sure you want to pay this bill using your stored payment information?"
      );
      if (!confirmPayment) return;
    }

    // If disputing the bill, prompt for note
    let note = null;
    if (action === "disputeBill") {
      note = window.prompt("Please explain your concerns/complaints:");
      // If user pressed Cancel, do nothing
      if (note === null) return;
    }

    try {
      const payload = note ? { note } : {};
      await axios.post(
        `/api/${action}/${billId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (action === "payBill") {
        alert("Bill successfully paid!");
      } else if (action === "disputeBill") {
        alert("Bill disputed successfully");
      }

      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.BillID === billId
            ? {
                ...bill,
                Status: action === "payBill" ? "Paid" : "Disputed",
                Note: note || bill.Note,
              }
            : bill
        )
      );
    } catch (err) {
      console.error(`Error ${action} bill:`, err);
    }
  };

  const respondToDispute = async (bill) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to perform this action.");
      return;
    }

    // Prompt for response to dispute
    const responseNote = window.prompt("Address the concerns from the client:");
    if (responseNote === null) return; // User canceled

    const notePrefix = "David Smith Note: ";
    let updatedNote = bill.Note ? `${bill.Note}\n${notePrefix}${responseNote}` : responseNote;

    // Prompt for optional amount change
    const newAmountInput = window.prompt("(Optional) Change the amount charged:");
    let newAmount = null;
    if (newAmountInput !== null && newAmountInput.trim() !== "") {
      const confirmChange = window.confirm("Are you sure you want to change the amount?");
      if (confirmChange) {
        newAmount = newAmountInput;
      }
    }

    try {
      await axios.post(
        `/api/respondDispute/${bill.BillID}`,
        {
          note: updatedNote,
          amount: newAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Dispute responded to successfully. Status changed to Pending.");

      setBills((prevBills) =>
        prevBills.map((b) =>
          b.BillID === bill.BillID
            ? {
                ...b,
                Status: "Pending",
                Note: updatedNote,
                Amount: newAmount ? newAmount : b.Amount,
              }
            : b
        )
      );
    } catch (err) {
      console.error("Error responding to dispute:", err);
      alert("Failed to respond to dispute.");
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
              {userId === 0 && <th style={{ padding: "12px" }}>User ID</th>}
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
                  {userId === 0 && (
                    <td style={{ padding: "12px" }}>{bill.UserID || "N/A"}</td>
                  )}
                  <td style={{ padding: "12px" }}>
                    {userId !== 0 && bill.Status === "Pending" && (
                      <>
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
                      </>
                    )}
                    {userId === 0 && bill.Status === "Dispute" && (
                      <button
                        onClick={() => respondToDispute(bill)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ffc107",
                          color: "#000",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Respond to Dispute
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              !error && (
                <tr>
                  <td
                    colSpan={userId === 0 ? "7" : "6"}
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
                    Login
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
                    Register
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
                    Submit Quote
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
                    Profile
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
                    Orders
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
                    Bills
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
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main>{token && <Bills />}</main>
    </div>
  );
};

export default HomePage;
