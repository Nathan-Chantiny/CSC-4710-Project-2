// This is the code for Dashboard page
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Quote = () => {
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { quoteId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];

    try {
      const res = await axios.patch(
        "http://localhost:5000/offer_reject",
        {
          quoteId,
          price,
          note,
          approval_status: "pending",
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error during submission:", err.response || err.message);
      if (err.response && err.response.data) {
        console.error("Backend error message:", err.response.data.message);
      }
      setError("Quote request failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div
      className="container"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "2rem",
          color: "#007bff",
          marginBottom: "20px",
        }}
      >
        Resubmit a Quote
      </h2>

      {/* Navigation Menu */}
      <nav style={{ textAlign: "center", marginBottom: "20px" }}>
        <ul
          style={{
            listStyleType: "none",
            padding: "0",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <li>
            <Link to="/" style={menuLinkStyle}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/profile" style={menuLinkStyle}>
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                ...menuLinkStyle, // Apply the same menu style to the logout button
                background: "#f5f5f5",
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {error && (
        <p className="error" style={{ color: "red" }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Note:</label>
          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Date:</label>
          <input
            type="date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>End date:</label>
          <input
            type="date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

// Define the common styles for the menu links
const menuLinkStyle = {
  textDecoration: "none",
  fontSize: "1.2rem",
  color: "#007bff",
  padding: "10px 20px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
  display: "inline-block",
  transition: "background-color 0.3s",
};

// Add a hover effect for the links
menuLinkStyle[":hover"] = {
  backgroundColor: "#e0e0e0",
};

export default Quote;
