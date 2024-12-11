import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Strings from "./Strings";
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

const Orders = () => {
  const token = localStorage.getItem("token"); // Check if the user is logged in
  const userId = getUserIdFromToken();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [userData, setUserData] = useState({ first: "", last: "" });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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

    const fetchOrders = async () => {
      try {
        const endpoint = userId === 0 ? "/orders" : "/specific_orders";
        const res = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Error fetching orders. Please try again.");
      }
    };

    fetchUserData();
    fetchOrders();
  }, [navigate, token, userId]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from localStorage
    navigate("/login"); // Redirect to login page
  };

  const handleBillAction = async (orderId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/generate_bill",
        { quoteId: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Bill generated!");
      window.location.reload();
    } catch (err) {
      console.error("Error generating bill:", err.message);
      alert("Failed to generate bill. Please try again.");
    }
  };

  //const handleCreateBill = async (e) => {};

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
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#333" }}>
          {Strings.ordersName}
        </h1>
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
            {token && (
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
            {token && (
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
            )}
            {token && (
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
            {token && (
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
      </header>

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
          <h2>{Strings.ordersName}</h2>
          {error && <p>{error}</p>}
          <div>
            {orders.map((order, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h1 style={h1Style}>
                  {index + 1}. {order.first} {order.last}{" "}
                </h1>
                <p>Order ID: {order.OrderID}</p>
                <p>Quote Request ID: {order.QuoteRequestID}</p>
                <p>Work Period: {order.WorkPeriod}</p>
                <p>Agreed Price: ${order.AgreedPrice}</p>
                <p>Status: {order.Status}</p>
                {/* Generate Bill */}
                <div>
                  {order.Status === "Pending" && (
                    <button
                      onClick={() => handleBillAction(order.QuoteRequestID)}
                      style={{ marginRight: "10px", padding: "5px 10px" }}
                    >
                      Generate Bill
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
            Welcome to Your Orders Page, {userData.first} {userData.last}!
          </h3>
          <h2>{Strings.ordersName}</h2>
          {error && <p>{error}</p>}
          <div>
            {orders.map((specificOrder, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h1 style={h1Style}>{index + 1}.</h1>
                <p>Work Period: {specificOrder.WorkPeriod}</p>
                <p>Agreed Price: ${specificOrder.AgreedPrice}</p>
                <p>Status: {specificOrder.Status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const h1Style = {
  fontSize: "1.5rem",
  color: "#333",
  marginBottom: "10px",
  textAlign: "left",
};

export default Orders;
