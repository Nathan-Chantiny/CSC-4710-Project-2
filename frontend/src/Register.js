import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [address, setAddress] = useState("");
  const [ccNum, setCcNum] = useState("");
  const [ccName, setCcName] = useState("");
  const [ccExp, setCcExp] = useState("");
  const [ccSec, setCcSec] = useState("");
  const [billAddr, setBillAddr] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/register", {
        first,
        last,
        address,
        cc_num: ccNum,
        cc_name: ccName,
        cc_exp: ccExp,
        cc_sec: ccSec,
        bill_addr: billAddr,
        phone,
        email,
        password,
      });
      if (res.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
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
        Register
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
            <Link to="/dashboard" style={menuLinkStyle}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/login" style={menuLinkStyle}>
              Login
            </Link>
          </li>
          <li>
            <Link to="/profile" style={menuLinkStyle}>
              Profile
            </Link>
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
          <label>First Name:</label>
          <input
            type="text"
            placeholder="First Name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            placeholder="Last Name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Credit Card Number:</label>
          <input
            type="text"
            placeholder="Credit Card Number"
            value={ccNum}
            onChange={(e) => setCcNum(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Credit Card Name:</label>
          <input
            type="text"
            placeholder="Credit Card Name"
            value={ccName}
            onChange={(e) => setCcName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Credit Card Expiration Date:</label>
          <input
            type="date"
            placeholder="Credit Card Expiration Date"
            value={ccExp}
            onChange={(e) => setCcExp(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Credit Card Security Code:</label>
          <input
            type="text"
            placeholder="Credit Card Security Code"
            value={ccSec}
            onChange={(e) => setCcSec(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Billing Address:</label>
          <input
            type="text"
            placeholder="Billing Address"
            value={billAddr}
            onChange={(e) => setBillAddr(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <Link to="/login">Already have an account? Login here</Link>
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

export default Register;
