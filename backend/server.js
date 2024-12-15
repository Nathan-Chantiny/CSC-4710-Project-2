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
        console.error("Error during registration:", err.message); // Log error
        return res
          .status(500)
          .json({ message: "User registration failed", error: err.message });
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
        "INSERT INTO orderofwork (QuoteRequestID, WorkPeriod, AgreedPrice, Status, cust_id, accept_date) VALUES (?, ?, ?, 'Pending', ?, CURRENT_DATE)",
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
        "INSERT INTO bill (OrderID, Amount, Status, userId, create_date) VALUES (?, ?, 'Pending', ?, CURRENT_DATE)",
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

// Big Clients Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "cust_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "order_count": 10
    },
    {
        "cust_id": 2,
        "first_name": "Alice",
        "last_name": "Smith",
        "order_count": 10
    }
]
  */}
  app.get("/big_clients", authenticateToken, (req, res) => {
    const query = `
        WITH CompletedOrders AS (
            SELECT 
                o.cust_id, 
                COUNT(o.OrderID) AS order_count
            FROM 
                orderofwork o
            JOIN 
                quotes q ON o.QuoteRequestID = q.quote_id
            WHERE 
                o.Status = 'Billed' 
            GROUP BY 
                o.cust_id
        ),
        MaxOrders AS (
            SELECT 
                MAX(order_count) AS max_count
            FROM 
                CompletedOrders
        )
        SELECT 
            u.id AS client_id,
            u.first AS first_name,
            u.last AS last_name,
            u.address,
            u.phone,
            u.email,
            c.order_count
        FROM 
            CompletedOrders c
        INNER JOIN 
            users u ON c.cust_id = u.id
        CROSS JOIN 
            MaxOrders m
        WHERE 
            c.order_count = m.max_count;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No big clients found" });
        }

        res.json(results);
    });
});



// Difficult Clients Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "client_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "phone": "1234567890",
        "email": "johndoe@example.com",
        "request_count": 3
    },
    {
        "client_id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "9876543210",
        "email": "janesmith@example.com",
        "request_count": 3
    }
]
  */}
app.get("/difficult_clients", authenticateToken, (req, res) => {
  const query = `
        WITH ApprovedQuotes AS (
            SELECT 
                cust_id, 
                COUNT(DISTINCT quote_id) AS request_count
            FROM 
                quotes
            WHERE 
                approval_status = 'approved'
            GROUP BY 
                cust_id
        ),
        DifficultClients AS (
            SELECT 
                cust_id
            FROM 
                ApprovedQuotes
            WHERE 
                request_count = 3
        )
        SELECT 
            u.id AS client_id,
            u.first AS first_name,
            u.last AS last_name,
            u.phone,
            u.email,
            aq.request_count
        FROM 
            users u
        INNER JOIN 
            ApprovedQuotes aq ON u.id = aq.cust_id
        WHERE 
            aq.request_count = 3;
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No difficult clients found" });
    }

    res.json(results); // Send the query result as the response
  });
});

// This Month Quotes Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "OrderID": 101,
        "QuoteRequestID": 202,
        "WorkPeriod": "2 weeks",
        "AgreedPrice": 1500.00,
        "Status": "Accepted",
        "cust_id": 12,
        "accept_date": "2024-12-05"
    },
    {
        "OrderID": 102,
        "QuoteRequestID": 203,
        "WorkPeriod": "1 week",
        "AgreedPrice": 800.00,
        "Status": "Billed",
        "cust_id": 15,
        "accept_date": "2024-12-12"
    }
]
  */}
app.get("/this_month_quotes", authenticateToken, (req, res) => {
    const query = `
        SELECT 
            OrderID, 
            QuoteRequestID, 
            WorkPeriod, 
            AgreedPrice, 
            Status, 
            cust_id, 
            accept_date
        FROM 
            orderofwork
        WHERE 
            MONTH(accept_date) = MONTH(CURRENT_DATE())
            AND YEAR(accept_date) = YEAR(CURRENT_DATE());
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No quotes found for this month" });
        }

        res.json(results); // Send the query result as the response
    });
});

// Prospective Clients Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "client_id": 2,
        "first_name": "Alice",
        "last_name": "Johnson",
        "phone": "1234567890",
        "email": "alicejohnson@example.com"
    },
    {
        "client_id": 3,
        "first_name": "Bob",
        "last_name": "Brown",
        "phone": "1234567890",
        "email": "bobbrown@example.com"
    }
]
  */}
app.get("/prospective_clients", authenticateToken, (req, res) => {
  const query = `
        SELECT 
            u.id AS client_id, 
            u.first AS first_name, 
            u.last AS last_name,
            u.phone, 
            u.email
        FROM 
            users u
        LEFT JOIN 
            quotes q
        ON 
            u.id = q.cust_id
        WHERE 
            q.cust_id IS NULL;
            AND u.id != 0;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No clients without quotes found" });
        }

        res.json(results); // Send the query result as the response
    });
});

// Largest Driveway Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "address": "456 Oak Ave",
        "square_feet": 3000
    },
    {
        "address": "789 Pine Dr",
        "square_feet": 3000
    }
]
  */}
app.get("/largest_driveway", authenticateToken, (req, res) => {
    const query = `
        WITH MaxSquareFeet AS (
            SELECT 
                MAX(square_feet) AS max_square_feet
            FROM 
                quotes
        ),
        LargestDriveways AS (
            SELECT 
                address, 
                square_feet
            FROM 
                quotes
            WHERE 
                square_feet = (SELECT max_square_feet FROM MaxSquareFeet)
        )
        SELECT 
            address, 
            square_feet
        FROM 
            LargestDriveways;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No driveways found" });
        }

        res.json(results); // Send the query result as the response
    });
});

// Overdue Bills Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "BillID": 101,
        "OrderID": 202,
        "Amount": 500.00,
        "Status": "Pending",
        "create_date": "2024-12-01",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "1234567890",
        "email": "johndoe@example.com"
    },
    {
        "BillID": 102,
        "OrderID": 203,
        "Amount": 300.00,
        "Status": "Dispute",
        "create_date": "2024-12-02",
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "9876543210",
        "email": "janesmith@example.com"
    }
]
  */}
app.get("/overdue_bills", authenticateToken, (req, res) => {
    const query = `
        SELECT 
            b.BillID,
            b.OrderID,
            b.Amount,
            b.Status,
            b.create_date,
            u.first AS first_name,
            u.last AS last_name,
            u.phone,
            u.email
        FROM 
            bill b
        INNER JOIN 
            users u ON b.userId = u.id
        WHERE 
            b.Status != 'Paid'
            AND b.create_date <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY);
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No overdue bills found" });
        }

        res.json(results); // Send the query result as the response
    });
});

// Bad Clients Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "client_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "phone": "1234567890",
        "email": "johndoe@example.com",
        "total_due": 1500.00
    },
    {
        "client_id": 3,
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "9876543210",
        "email": "janesmith@example.com",
        "total_due": 750.00
    }
]
  */}
app.get("/bad_clients", authenticateToken, (req, res) => {
    const query = `
        WITH OverdueBills AS (
            SELECT 
                userId,
                SUM(Amount) AS total_due
            FROM 
                bill
            WHERE 
                create_date <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND Status != 'Paid'
            GROUP BY 
                userId
        ),
        BadClients AS (
            SELECT 
                u.id AS client_id,
                u.first AS first_name,
                u.last AS last_name,
                u.phone,
                u.email,
                COALESCE(ob.total_due, 0) AS total_due
            FROM 
                users u
            LEFT JOIN 
                OverdueBills ob ON u.id = ob.userId
            WHERE 
                u.id NOT IN (
                    SELECT DISTINCT userId 
                    FROM bill 
                    WHERE create_date <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                    AND Status = 'Paid'
                )
            AND u.id IN (SELECT userId FROM bill)
        )
        SELECT 
            client_id, 
            first_name, 
            last_name, 
            phone, 
            email, 
            total_due
        FROM 
            BadClients;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No bad clients found" });
        }

        res.json(results); // Send the query result as the response
    });
});

// Good Clients Endpoint
{/*
  EXAMPLE OUTPUT:
  [
    {
        "client_id": 1,
        "first_name": "Alice",
        "last_name": "Johnson",
        "phone": "1234567890",
        "email": "alicejohnson@example.com"
    },
    {
        "client_id": 2,
        "first_name": "Bob",
        "last_name": "Brown",
        "phone": "9876543210",
        "email": "bobbrown@example.com"
    }
]
  */}
app.get("/good_clients", authenticateToken, (req, res) => {
    const query = `
        SELECT 
            DISTINCT u.id AS client_id,
            u.first AS first_name,
            u.last AS last_name,
            u.phone,
            u.email
        FROM 
            users u
        INNER JOIN 
            bill b ON u.id = b.userId
        WHERE 
            b.Status = 'Paid'
            AND DATEDIFF(CURRENT_DATE(), b.create_date) <= 1;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No good clients found" });
        }

        res.json(results); // Send the query result as the response
    });
});