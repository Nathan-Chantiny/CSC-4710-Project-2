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
  host: "localhost", // Database host, usually 'localhost'
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
  } = req.body; 
  const hashedPassword = await bcrypt.hash(password, 10);

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
          .json({ message: "User registration failed", error: err });
      }
      res.status(201).json({ message: "User registered successfully" });
    }
  );
});

// User login route
app.post("/login", (req, res) => {
  const { email, password } = req.body; 

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
        expiresIn: "3h",
      });

      res.status(200).json({ message: "Login successful", token });
    }
  );
});

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.error("No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.get("/quote", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the quote page. You are authenticated!" });
});

app.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.query(
    "SELECT first, last FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ first: result[0].first, last: result[0].last });
    }
  );
});

app.post("/add_quote", authenticateToken, (req, res) => {
  const cust_id = req.user.userId;
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
  } = req.body;

  db.query(
    "INSERT INTO quotes (cust_id, address, square_feet, price, picture_one, picture_two, picture_three, picture_four, picture_five, note, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
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

app.get("/quotes", authenticateToken, (req, res) => {
  const query = `
    SELECT quotes.*, users.first, users.last, users.phone, users.email 
    FROM quotes 
    JOIN users ON quotes.cust_id = users.id
  `;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching quotes", error: err.message });
    }
    res.json(result);
  });
});

app.patch("/quote_approve", authenticateToken, (req, res) => {
  const { quoteId, approvalStatus, startDate, endDate, counterPrice } =
    req.body;

  db.query(
    "UPDATE quotes SET approval_status = ?, start_date = ?, end_date = ?, cost = ? WHERE quote_id = ?",
    [approvalStatus, startDate, endDate, counterPrice, quoteId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to update status", error: err.message });
      }
      res.json({ message: "Status updated successfully" });
    }
  );
});

app.patch("/quote_deny", authenticateToken, (req, res) => {
  const { quoteId, approvalStatus, denyReason } = req.body;

  db.query(
    "UPDATE quotes SET approval_status = ?, deny_reason = ? WHERE quote_id = ?",
    [approvalStatus, denyReason, quoteId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to update status", error: err.message });
      }
      res.json({ message: "Status updated successfully" });
    }
  );
});

app.post("/offer_accept", authenticateToken, (req, res) => {
  const { quoteId } = req.body;

  db.query(
    "SELECT price, cost, start_date, end_date FROM quotes WHERE quote_id = ?",
    [quoteId],
    (err, result) => {
      if (err) {
        console.error("Error fetching quote details:", err.message);
        return res
          .status(500)
          .json({
            message: "Error fetching quote details",
            error: err.message,
          });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const { price, cost, start_date, end_date } = result[0];
      const workPeriod = `${start_date} to ${end_date}`;
      const agreedPrice = cost || price;

      db.query(
        "INSERT INTO orderofwork (QuoteRequestID, WorkPeriod, AgreedPrice, Status) VALUES (?, ?, ?, 'Pending')",
        [quoteId, workPeriod, agreedPrice],
        (err, result) => {
          if (err) {
            console.error("Error creating order of work:", err.message);
            return res
              .status(500)
              .json({
                message: "Failed to create order of work",
                error: err.message,
              });
          }

          db.query(
            "UPDATE quotes SET approval_status = 'in progress' WHERE quote_id = ?",
            [quoteId],
            (err, result) => {
              if (err) {
                console.error("Error updating approval_status:", err.message);
                return res
                  .status(500)
                  .json({
                    message: "Failed to update approval status",
                    error: err.message,
                  });
              }

              if (result.affectedRows === 0) {
                console.error("No rows updated for approval_status.");
                return res
                  .status(404)
                  .json({
                    message: "Quote not found or approval status already set",
                  });
              }

              res.status(201).json({
                message:
                  "Order of work created and quote status updated successfully",
              });
            }
          );
        }
      );
    }
  );
});

app.patch("/offer_reject", authenticateToken, (req, res) => {
  const { quoteId, price, note, approval_status, start_date, end_date } = req.body;

  db.query(
    "UPDATE quotes SET price = ?, note = ?, approval_status = ?, start_date = ?, end_date = ? WHERE quote_id = ?",
    [price, note, approval_status, start_date, end_date, quoteId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update quote",
          error: err.message,
        });
      }
      res
        .status(201)
        .json({ message: "Quote updated successfully" });
    }
  );
});

app.patch("/quote_delete", authenticateToken, (req, res) => {
  const { quoteId } = req.body;

  db.query("DELETE FROM quotes WHERE quote_id = ?", [quoteId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete quote",
        error: err.message,
      });
    }
    res.status(201).json({ message: "Quote deleted successfully" });
  });
});

app.get("/specific_quotes", authenticateToken, (req, res) => {
  const cust_id = req.user.userId;

  db.query("SELECT * FROM quotes WHERE cust_id=?", [cust_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching quotes", error: err });
    }
    res.json(result);
  });
});

// ** Updated Code for Fetching Bills **
app.get('/api/getBills', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  let query = `
    SELECT b.BillID, b.OrderID, b.Amount, b.Status, b.Note, b.userId AS UserID, o.WorkPeriod
    FROM bill b
    LEFT JOIN orderofwork o ON b.OrderID = o.OrderID
  `;

  // If the user is not userId: 0, they only see their own bills
  if (userId !== 0) {
    query += ' WHERE b.userId = ?';
  }

  db.query(query, userId !== 0 ? [userId] : [], (err, results) => {
    if (err) {
      console.error('Error fetching bills:', err.message);
      return res.status(500).json({ message: 'Error fetching bills', error: err.message });
    }
    res.json(results);
  });
});


app.post("/generate_bill", authenticateToken, (req, res) => {
  const { quoteId } = req.body;
  const userId = req.user.userId;

  // Check if the user is David Smith (userId 0)
  if (userId !== 0) {
    return res.status(403).json({ message: "Unauthorized action" });
  }

  db.query(
    "SELECT * FROM orderofwork WHERE QuoteRequestID = ?",
    [quoteId],
    (err, result) => {
      if (err) {
        console.error("Error fetching order of work:", err.message);
        return res.status(500).json({ message: "Failed to fetch order of work", error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Order of work not found" });
      }

      const { OrderID, AgreedPrice } = result[0];

      db.query(
        "INSERT INTO bill (OrderID, Amount, userId) VALUES (?, ?, 0)",
        [OrderID, AgreedPrice],
        (err, result) => {
          if (err) {
            console.error("Error creating bill:", err.message);
            return res.status(500).json({ message: "Failed to create bill", error: err.message });
          }

          console.log("Bill created successfully for OrderID:", OrderID);
          res.status(201).json({ message: "Bill generated successfully" });
        }
      );
    }
  );
});
