// Required dependencies
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jwt_auth_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
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
  });
});

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

  db.query("SELECT first, last FROM users WHERE id = ?", [userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ first: result[0].first, last: result[0].last });
  });
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
  const user_id = req.user.userId;
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
        "INSERT INTO orderofwork (QuoteRequestID, WorkPeriod, AgreedPrice, Status, cust_id) VALUES (?, ?, ?, 'Pending', ?)",
        [quoteId, workPeriod, agreedPrice, user_id],
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
      res.status(201).json({ message: "Quote updated successfully" });
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

app.get('/api/getBills', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  let query = `
    SELECT b.BillID, b.OrderID, b.Amount, b.Status, b.Note, b.userId AS UserID, o.WorkPeriod
    FROM bill b
    LEFT JOIN orderofwork o ON b.OrderID = o.OrderID
  `;

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

  if (userId !== 0) {
    return res.status(403).json({ message: "Unauthorized action" });
  }

  db.query(
    "SELECT * FROM orderofwork WHERE QuoteRequestID = ?",
    [quoteId],
    (err, result) => {
      if (err) {
        console.error("Error fetching order of work:", err.message);
        return res.status(500).json({
          message: "Failed to fetch order of work",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Order of work not found" });
      }

      const { OrderID, AgreedPrice, cust_id } = result[0];
      console.log(
        "\nOrderID:", OrderID,
        "\nAgreedPrice:", AgreedPrice,
        "\ncust_id:", cust_id
      );

      db.query(
        "INSERT INTO bill (OrderID, Amount, Status, userId) VALUES (?, ?, 'Pending', ?)",
        [OrderID, AgreedPrice, cust_id],
        (err, result) => {
          if (err) {
            console.error("Error creating bill:", err.message);
            return res
              .status(500)
              .json({ message: "Failed to create bill", error: err.message });
          }

          db.query(
            "UPDATE orderofwork SET Status = 'Billed' WHERE QuoteRequestID = ?",
            [quoteId],
            (err, result) => {
              if (err) {
                console.error("Error updating order status:", err.message);
                return res
                  .status(500)
                  .json({ message: "Failed to update order status", error: err.message });
              }

              res.status(201).json({ message: "Bill generated successfully" });
            }
          );
        }
      );
    }
  );
});

app.post("/api/payBill/:billId", authenticateToken, (req, res) => {
  const billId = req.params.billId;
  
  db.query(
    "UPDATE bill SET Status = 'Paid' WHERE BillID = ?",
    [billId],
    (err, result) => {
      if (err) {
        console.error("Error updating bill status:", err);
        return res.status(500).json({ message: "Failed to update bill status" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json({ message: "Bill paid successfully" });
    }
  );
});

app.post("/api/disputeBill/:billId", authenticateToken, (req, res) => {
  const billId = req.params.billId;
  const { note } = req.body;

  db.query(
    "UPDATE bill SET Status = 'Dispute', Note = ? WHERE BillID = ?",
    [note, billId],
    (err, result) => {
      if (err) {
        console.error("Error disputing bill:", err);
        return res.status(500).json({ message: "Failed to dispute bill" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json({ message: "Bill disputed successfully" });
    }
  );
});

app.post("/api/respondDispute/:billId", authenticateToken, (req, res) => {
  const billId = req.params.billId;
  const { note, amount } = req.body;
  const userId = req.user.userId;

  if (userId !== 0) {
    return res.status(403).json({ message: "Unauthorized action" });
  }

  // Build query and params dynamically
  let query = "UPDATE bill SET Note = ?, Status = 'Pending' ";
  let params = [note, billId];

  if (amount && amount.trim() !== "") {
    query = "UPDATE bill SET Note = ?, Amount = ?, Status = 'Pending' WHERE BillID = ?";
    params = [note, amount, billId];
  } else {
    query += "WHERE BillID = ?";
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error responding to dispute:", err);
      return res.status(500).json({ message: "Failed to respond to dispute" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Responded to dispute successfully" });
  });
});

app.get("/orders", authenticateToken, (req, res) => {
  const query = `
    SELECT orderofwork.*, users.first, users.last
    FROM orderofwork
    JOIN quotes ON orderofwork.QuoteRequestID = quotes.quote_id
    JOIN users ON quotes.cust_id = users.id
  `;
  db.query(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching orders", error: err.message });
    }
    res.json(result);
  });
});

app.get("/specific_orders", authenticateToken, (req, res) => {
  const user_id = req.user.userId;

  db.query("SELECT * FROM orderofwork WHERE cust_id=?", [user_id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching orders", error: err });
    }
    res.json(result);
  });
});

app.get("/big_clients", authenticateToken, (req, res) => {});

app.get("/difficult_clients", authenticateToken, (req, res) => {});

app.get("/this_month_quotes", authenticateToken, (req, res) => {});

app.get("/prospective_clients", authenticateToken, (req, res) => {});

app.get("/largest_driveway", authenticateToken, (req, res) => {});

app.get("/overdue_bills", authenticateToken, (req, res) => {});

app.get("/bad_clients", authenticateToken, (req, res) => {});

app.get("/good_clients", authenticateToken, (req, res) => {});
