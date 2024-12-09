import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId; // Adjust this based on your token structure
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const userId = getUserIdFromToken(); // Extract the user ID from the JWT token
  const [userData, setUserData] = useState({ first: "", last: "" });
  const [quotes, setQuotes] = useState([]);
  const [specificQuotes, setSpecificQuotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response && err.response.status === 401) {
          navigate("/login"); // Redirect to login page if unauthorized
        }
      }
    };

    const fetchQuotes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/quotes", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        });
        setQuotes(res.data);
      } catch (err) {
        console.error("Error fetching quotes:", err);
        setError("Error fetching quotes. Please try again.");
      }
    };

    const fetchSpecificQuotes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/specific_quotes", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        });
        setSpecificQuotes(res.data);
      } catch (err) {
        console.error("Error fetching quotes:", err);
      }
    };

    fetchUserData();
    fetchQuotes();
    fetchSpecificQuotes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from localStorage
    navigate("/login"); // Redirect to login page
  };

  const handleApprove = async (quoteId, price) => {
    const token = localStorage.getItem("token");

    // Prompt the user for start and end dates
    const startDate = prompt("Enter the start date (YYYY-MM-DD):");
    const endDate = prompt("Enter the end date (YYYY-MM-DD):");

    if (!startDate || !endDate) {
      alert("Start date and end date are required.");
      return;
    }

    try {
      // Update quote approval status
      await axios.patch(
        "http://localhost:5000/update_quote_status",
        { quoteId, approvalStatus: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create the order of work
      await axios.post(
        "http://localhost:5000/create_order_of_work",
        { quoteId, workPeriod: `${startDate} to ${endDate}`, agreedPrice: price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Quote approved and order of work created!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error("Error approving quote or creating order of work:", err.message);
      alert("Failed to process the quote approval. Please try again.");
    }
  };

  const handleDeny = async (quoteId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        "http://localhost:5000/update_quote_status",
        { quoteId, approvalStatus: "denied" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quote denied!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error("Error denying quote:", err.message);
      alert("Failed to deny the quote. Please try again.");
    }
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
        Profile
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
            <Link to="/quote" style={menuLinkStyle}>
              Quote
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                ...menuLinkStyle,
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

      {/* Profile Content */}
      {userId === 0 ? (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              color: "#007bff",
              marginBottom: "15px",
            }}
          >
            Welcome to Your Profile Page, David Smith!
          </h3>
          <h2>Quotes</h2>
          {error && <p>{error}</p>}
          <div>
            {quotes.map((quote, index) => (
              <div key={quote.id} style={{ marginBottom: "20px" }}>
                <h3>{index + 1}.</h3>
                <h1 style={h1Style}>
                  {quote.first} {quote.last} -{">"} {quote.phone}, {quote.email}{" "}
                </h1>
                <p>Address: {quote.address}</p>
                <p>Square Feet: {quote.square_feet}</p>
                <p>Price: {quote.price}</p>
                <p>Note: {quote.note}</p>
                <p>Approval Status: {quote.approval_status}</p> {/* Display approval status */}
                <div>
                  <button
                    onClick={() => handleApprove(quote.id, quote.price)}
                    style={{ marginRight: "10px", padding: "5px 10px" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(quote.id)}
                    style={{ padding: "5px 10px" }}
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              color: "#007bff",
              marginBottom: "15px",
            }}
          >
            Welcome to Your Profile Page, {userData.first} {userData.last}!
          </h3>
          <h2>Quotes</h2>
          {error && <p>{error}</p>}
          <div>
            {specificQuotes.map((specificQuote, index) => (
              <div key={specificQuote.id} style={{ marginBottom: "20px" }}>
                <h3>{index + 1}.</h3>
                <h3>
                  {specificQuote.first} {specificQuote.last}
                </h3>
                <p>Address: {specificQuote.address}</p>
                <p>Square Feet: {specificQuote.square_feet}</p>
                <p>Price: {specificQuote.price}</p>
                <p>Note: {specificQuote.note}</p>
                <p>Approval Status: {specificQuote.approval_status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Define the common styles for the menu links and buttons
const menuLinkStyle = {
  textDecoration: 'none',
  fontSize: '1.2rem',
  color: '#007bff',
  padding: '10px 20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  display: 'inline-block',
  transition: 'background-color 0.3s',
};

// Add a hover effect for the links and buttons
menuLinkStyle[':hover'] = {
  backgroundColor: '#e0e0e0',
};

const h1Style = {
  fontSize: "1.5rem",
  color: "#333",
  marginBottom: "10px",
  textAlign: "left",
};

export default Profile;
