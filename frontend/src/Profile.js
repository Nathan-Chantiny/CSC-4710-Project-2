import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Strings from "./Strings";

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
  const [filterStatus, setFilterStatus] = useState("all");
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
    const counterPrice = prompt("Enter cost for work:");
    const startDate = prompt("Enter the start date (YYYY-MM-DD):");
    const endDate = prompt("Enter the end date (YYYY-MM-DD):");

    if (!startDate || !endDate || !counterPrice) {
      if (!startDate) {
        alert("Start date is required.");
      } else if (!endDate) {
        alert("End date is required.");
      } else if (!counterPrice) {
        alert("Cost is required.");
      }
      return;
    }

    try {
      // Update quote approval status
      await axios.patch(
        "http://localhost:5000/quote_approve",
        { quoteId, approvalStatus: "approved", startDate, endDate, counterPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Quote approved!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error("Error approving quote:", err.message);
      alert("Failed to process the quote approval. Please try again.");
    }
  };

  const handleDeny = async (quoteId) => {
    const token = localStorage.getItem("token");

    // Prompt the user for start and end dates
    const denyReason = prompt("Enter reason for denial:");

    try {
      await axios.patch(
        "http://localhost:5000/quote_deny",
        { quoteId, approvalStatus: "denied", denyReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quote denied!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error("Error denying quote:", err.message);
      alert("Failed to deny the quote. Please try again.");
    }
  };

  const handleAccept = async (quoteId) => {
    const token = localStorage.getItem("token");

    try {
      // Create the order of work
      await axios.post(
        "http://localhost:5000/offer_accept",
        { quoteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Order of work created!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error(
        "Error creating order of work:",
        err.message
      );
      alert("Failed to create order of work. Please try again.");
    }
  };

  const handleRequoteNavigaton = async (quoteId) => {
    try {
      const data = { quoteId };
      navigate("/requote", { state: data }); // Passing data via state
    } catch (err) {
      console.error("Error:", err.message);
      alert("There was an error going to /requote.");
    }
  };

  const handleDelete = async (quoteId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        "http://localhost:5000/quote_delete",
        { quoteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quote deleted!");
      window.location.reload(); // Reload to fetch the updated quotes
    } catch (err) {
      console.error("Error deleting quote:", err.message);
      alert("Failed to delete the quote. Please try again.");
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
        {Strings.quoteName}
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
          {localStorage.getItem("token") && userId !== 0 && (
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
          {localStorage.getItem("token") && (
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
          )}
          {localStorage.getItem("token") && (
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
          )}
          {localStorage.getItem("token") && (
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
          )}
          {localStorage.getItem("token") && (
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
          )}
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
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label htmlFor="filter" style={{ marginRight: "10px" }}>
              Filter by Status:
            </label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "5px 10px" }}
            >
              <option value="all">All</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
            </select>
          </div>
          <div>
            {quotes
              .filter(
                (quote) =>
                  filterStatus === "all" ||
                  quote.approval_status === filterStatus
              )
              .map((quote, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h1 style={h1Style}>
                    {index + 1}. {quote.first} {quote.last} -{">"} {quote.phone}
                    , {quote.email}{" "}
                  </h1>
                  <p>Address: {quote.address}</p>
                  <p>Square Feet: {quote.square_feet}</p>
                  <p>Price: {quote.price}</p>
                  <p>Note: {quote.note}</p>
                  <p>Approval Status: {quote.approval_status}</p>{" "}
                  {/* Display approval status */}
                  <div>
                    {quote.approval_status === "pending" && (
                      <button
                        onClick={() =>
                          handleApprove(quote.quote_id, quote.price)
                        }
                        style={{ marginRight: "10px", padding: "5px 10px" }}
                      >
                        Approve
                      </button>
                    )}
                    {quote.approval_status === "pending" && (
                      <button
                        onClick={() => handleDeny(quote.quote_id)}
                        style={{ marginRight: "10px", padding: "5px 10px" }}
                      >
                        Deny
                      </button>
                    )}
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
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label htmlFor="filter" style={{ marginRight: "10px" }}>
              Filter by Status:
            </label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "5px 10px" }}
            >
              <option value="all">All</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
            </select>
          </div>
          <div>
            {specificQuotes
              .filter(
                (quote) =>
                  filterStatus === "all" ||
                  quote.approval_status === filterStatus
              )
              .map((specificQuote, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h1 style={h1Style}>{index + 1}.</h1>
                  <p>Address: {specificQuote.address}</p>
                  <p>Square Feet: {specificQuote.square_feet}</p>
                  <p>Price: {specificQuote.price}</p>
                  <p>Note: {specificQuote.note}</p>
                  <p>Approval Status: {specificQuote.approval_status}</p>
                  {specificQuote.start_date != null && (
                    <p>
                      Proposed start date:{" "}
                      {new Date(specificQuote.start_date).toLocaleDateString()}
                    </p>
                  )}
                  {specificQuote.end_date != null && (
                    <p>
                      Proposed end date:{" "}
                      {new Date(specificQuote.end_date).toLocaleDateString()}
                    </p>
                  )}
                  {specificQuote.cost !== null && (
                    <p>Proposed cost: {specificQuote.cost}</p>
                  )}
                  {specificQuote.deny_reason !== null && (
                    <p>Reason for denial: {specificQuote.deny_reason}</p>
                  )}
                  {/* Display approval status */}
                  <div>
                    {specificQuote.approval_status === "approved" && (
                      <button
                        onClick={() =>
                          handleAccept(
                            specificQuote.quote_id,
                            specificQuote.price
                          )
                        }
                        style={{ marginRight: "10px", padding: "5px 10px" }}
                      >
                        Accept
                      </button>
                    )}
                    {specificQuote.approval_status === "approved" && (
                      <button
                        onClick={() =>
                          handleRequoteNavigaton(specificQuote.quote_id)
                        }
                        style={{ padding: "5px 10px" }}
                      >
                        Reject
                      </button>
                    )}
                    {specificQuote.approval_status === "denied" && (
                      <button
                        onClick={() => handleDelete(specificQuote.quote_id)}
                        style={{ padding: "5px 10px" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
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
