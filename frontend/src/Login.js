import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Strings from "./Strings";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token); // Save JWT token in localStorage
      navigate("/"); // Redirect to home after successful login
    } catch (err) {
      setError("Login failed. Please try again.");
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
        Login
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
          {!localStorage.getItem("token") && (
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
          )}
        </ul>
      </nav>

      {error && (
        <p className="error" style={{ color: "red" }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
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

export default Login;
