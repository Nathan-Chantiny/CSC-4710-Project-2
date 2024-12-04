// This is the code for Dashboard page
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Quote = () => {
  const [address, setAddress] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [price, setPrice] = useState("");
  const [pictureOne, setPictureOne] = useState("");
  const [pictureTwo, setPictureTwo] = useState("");
  const [pictureThree, setPictureThree] = useState("");
  const [pictureFour, setPictureFour] = useState("");
  const [pictureFive, setPictureFive] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    // Check token validity
    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.error("Token has expired");
        localStorage.removeItem("token");
        setError("User is not authenticated. Please log in again.");
        return;
      }
    } catch (err) {
      console.error("Invalid token:", err);
      setError("User is not authenticated. Please log in again.");
      return;
    }
    
    console.log("Submitting with data:", {
      address,
      square_feet: squareFeet,
      price,
      picture_one: pictureOne,
      picture_two: pictureTwo,
      picture_three: pictureThree,
      picture_four: pictureFour,
      picture_five: pictureFive,
      note,
    });

    try {
      const res = await axios.post(
        "http://localhost:5000/add_quote",
        {
          address,
          square_feet: squareFeet,
          price,
          picture_one: pictureOne,
          picture_two: pictureTwo,
          picture_three: pictureThree,
          picture_four: pictureFour,
          picture_five: pictureFive,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        navigate("/");
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
        Request A Quote
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
          <label>Square Feet:</label>
          <input
            type="number"
            placeholder="Square Feet"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>Picture One:</label>
          <input
            type="text"
            placeholder="Picture One"
            value={pictureOne}
            onChange={(e) => setPictureOne(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Two:</label>
          <input
            type="text"
            placeholder="Picture Two"
            value={pictureTwo}
            onChange={(e) => setPictureTwo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Three:</label>
          <input
            type="text"
            placeholder="Picture Three"
            value={pictureThree}
            onChange={(e) => setPictureThree(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Four:</label>
          <input
            type="text"
            placeholder="Picture Four"
            value={pictureFour}
            onChange={(e) => setPictureFour(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Five:</label>
          <input
            type="text"
            placeholder="Picture Five"
            value={pictureFive}
            onChange={(e) => setPictureFive(e.target.value)}
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
