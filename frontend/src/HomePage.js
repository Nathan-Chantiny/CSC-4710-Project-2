import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import Strings from "./Strings";

const HomePage = () => {
  const token = localStorage.getItem('token'); // Check if the user is logged in
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from localStorage
    navigate("/login"); // Redirect to login page
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
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#333" }}>
          David Smiths Driveway Sealing
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
            {!localStorage.getItem("token") && (
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
            )}
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
                  {Strings.quoteName}
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
                  {Strings.profileName}
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

      {/* Short intro to David Smith's business */}
      <section style={{ marginBottom: "30px" }}>
        <h2
          style={{
            fontSize: "2rem",
            color: "#007bff",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          David Smith's Driveway Sealing
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}>
          David Smith's Driveway Sealing is a locally owned and operated
          business specializing in premium driveway maintenance and sealing
          services. With over a decade of experience, David and his team are
          dedicated to helping homeowners and businesses protect and enhance the
          appearance of their driveways.
        </p>

        <h2
          style={{
            fontSize: "2rem",
            color: "#007bff",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Services Offered:
        </h2>
        <ul>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Sealcoating:</strong> Protect your driveway from cracks, UV
            damage, and water penetration with high-quality sealants.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Crack Filling:</strong> Extend the life of your driveway by
            sealing cracks to prevent further damage.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Line Striping:</strong> Precision line striping for
            commercial properties to ensure safety and curb appeal.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Pothole Repair:</strong> Efficient and durable repairs for
            potholes caused by wear and weather.
          </li>
        </ul>

        <h2
          style={{
            fontSize: "2rem",
            color: "#007bff",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Why Choose Us?
        </h2>
        <ul>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Expert Craftsmanship:</strong> Every job is completed with
            meticulous attention to detail.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Top-Quality Materials:</strong> We use industry-leading
            products for long-lasting results.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Affordable Pricing:</strong> Competitive rates with no
            hidden fees.
          </li>
          <li
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            <strong>Customer-Centric Service:</strong> We prioritize your
            satisfaction, offering free consultations and flexible scheduling.
          </li>
        </ul>

        <p style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}>
          Whether it’s a residential driveway or a large commercial lot,
          <strong> David Smith's Driveway Sealing</strong> provides the
          expertise and care to keep your surfaces smooth, safe, and looking
          their best. Contact us today for a free estimate and let us help you
          protect your investment!
        </p>
      </section>

      {/* Main Content */}
      <main>
        {/* Project Overview Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "2rem",
              color: "#007bff",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            About This Project
          </h2>
          <p
            style={{ fontSize: "1.2rem", color: "#555", textAlign: "justify" }}
          >
            This project is a simple demonstration of a website that can be used
            to request quotes for driveway sealing services. It is built using
            React for the frontend and Node.js with Express for the backend. The
            project uses JWT for authentication and authorization of users.
          </p>
          <ul
            style={{ fontSize: "1.2rem", color: "#555", marginBottom: "20px" }}
          >
            <li>
              **Home Page**: This public page provides an overview of David
              Smiths Driveway Sealing services.
            </li>
            <li>
              **Login**: Users can log in and receive a JWT, which is stored in
              the browser. Once logged in, users can access protected routes.
            </li>
            <li>
              **Register**: New users can register and create an account. Users
              are asked to add basic information.
            </li>
            <li>
              **Quote**: A protected page that can only be accessed with a valid
              JWT. Allows users to submit quotes.
            </li>
            <li>
              **Profile**: Allows users to view their submitted quotes and for
              David Smith to see all user submitted quotes.
            </li>
            <li>
              **Bills**: Allows users to view their bills and for David Smith to
              view all bills submitted to customers.
            </li>
            <li>**Logout**: Logs users out and revokes their token.</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "10px 0",
          borderTop: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
        }}
      >
        <p style={{ fontSize: "0.9rem", color: "#777" }}>
          &copy; 2024 My Website. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
