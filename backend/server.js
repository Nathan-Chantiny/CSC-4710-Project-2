// Required dependencies
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware to parse JSON data and handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost", // Database host, usually 'localhost' in local development
  user: "root", // Default username in XAMPP
  password: "", // Leave blank if no password is set in XAMPP
  database: "jwt_auth_db", // Database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// User registration route
app.post("/register", async (req, res) => {
  const {
    first,
    last,
    address,
    cc_num,
    cc_name,
    cc_exp,
    cc_sec,
    bill_addr,
    phone,
    email,
    password,
  } = req.body; // Extract all required fields from request body
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt with 10 salt rounds

  // Insert the new user into the 'users' table
  db.query(
    "INSERT INTO users (first, last, address, cc_num, cc_name, cc_exp, cc_sec, bill_addr, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      first,
      last,
      address,
      cc_num,
      cc_name,
      cc_exp,
      cc_sec,
      bill_addr,
      phone,
      email,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "User registration failed", error: err }); // Send error response if registration fails
      }
      res.status(201).json({ message: "User registered successfully" }); // Send success response
    }
  );
});

// User login route
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // Query the database for the user with the provided email
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err }); // Send error response if query fails
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" }); // Send error response if user not found
      }

      const user = results[0]; // Get the user record from the query result
      const passwordMatch = await bcrypt.compare(password, user.password); // Compare the provided password with the hashed password

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" }); // Send error response if password does not match
      }

      // Generate a JWT token with the user ID and a secret key, valid for 3 hour
      const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
        expiresIn: "3h",
      });

      res.status(200).json({ message: "Login successful", token }); // Send success response with the token
    }
  );
});

// Middleware function to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected route that requires JWT authentication
app.get("/quote", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the quote page. You are authenticated!" }); // Send a success message if authentication is valid
});

app.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from the decoded JWT token

  // Query the database to get the user data based on the userId
  db.query(
    "SELECT username, email FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).json({ message: "User not found" }); // Send error if user not found
      }

      // Send user profile data as response
      res.json({ username: result[0].username, email: result[0].email });
    }
  );
});

// Adds quote requests to the quotes table
app.post("/add_quote", authenticateToken, (req, res) => {
  const cust_id = req.user.userId; // Extract userId from the decoded JWT token
  const {
    address,
    square_feet,
    price,
    picture_one,
    picture_two,
    picture_three,
    picture_four,
    picture_five,
    note,
  } = req.body; // Extract all required fields from request body

  // Debugging logs
  console.log("Received add_quote request with data:", {
    cust_id,
    address,
    square_feet,
    price,
    picture_one,
    picture_two,
    picture_three,
    picture_four,
    picture_five,
    note,
  });

  // Query the database to insert the quote request
  db.query(
    "INSERT INTO quotes (cust_id, address, square_feet, price, picture_one, picture_two, picture_three, picture_four, picture_five, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      cust_id,
      address,
      square_feet,
      price,
      picture_one,
      picture_two,
      picture_three,
      picture_four,
      picture_five,
      note,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ message: "Quote request failed", error: err.message });
      }
      res.status(201).json({ message: "Quote submitted successfully" });
    }
  );
});
