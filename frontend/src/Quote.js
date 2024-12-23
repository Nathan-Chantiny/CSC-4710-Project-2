// This is the code for Dashboard page
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Strings from "./Strings";

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

    const formData = new FormData();
    formData.append("address", address);
    formData.append("square_feet", squareFeet);
    formData.append("price", price);
    formData.append("note", note);
    formData.append("picture_one", pictureOne);
    formData.append("picture_two", pictureTwo);
    formData.append("picture_three", pictureThree);
    formData.append("picture_four", pictureFour);
    formData.append("picture_five", pictureFive);

    try {
    const res = await axios.post("http://localhost:5000/add_quote", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 201) {
      navigate("/");
    }
  } catch (err) {
    console.error("Error during submission:", err.response || err.message);
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
          {localStorage.getItem("token") && (
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
            type="file"
            //placeholder="Picture One"
            //value={pictureOne}
            onChange={(e) => setPictureOne(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Two:</label>
          <input
            type="file"
            //placeholder="Picture Two"
            //value={pictureTwo}
            onChange={(e) => setPictureTwo(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Three:</label>
          <input
            type="file"
            //placeholder="Picture Three"
            //value={pictureThree}
            onChange={(e) => setPictureThree(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Four:</label>
          <input
            type="file"
            //placeholder="Picture Four"
            //value={pictureFour}
            onChange={(e) => setPictureFour(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label>Picture Five:</label>
          <input
            type="file"
            //placeholder="Picture Five"
            //value={pictureFive}
            onChange={(e) => setPictureFive(e.target.files[0])}
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
