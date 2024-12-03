const express = require("express");
const path = require("path");
//const cookieParser = require("cookie-parser");
require('dotenv').config();
const session = require("express-session");
const mongoose = require('mongoose').set('debug', true);
const bcrypt = require("bcrypt");
var database = require("./config/database");
database.connect();
const crypt3 = require('crypt3-passwd')
const User = require("./model/user");
const Transaction = require("./model/transaction");
const auth = require("./middleware/auth");
const { sessionMiddleware, verifySession, verifyAdmin } = require("./middleware/auth");
//require('dotenv').config();
const app = express(); const PORT = process.env.PORT || 4000;
console.log(process.env.MONGO_URI);
const cors = require('cors');

   const corsOptions = {
    origin: '*', //included origin as true
    credentials: true, //included credentials as true
};
app.use(sessionMiddleware()); // Apply session middleware globally
app.use(cors(corsOptions));
// Allow requests from the frontend (React)
//app.use(cors({
//  origin: 'https://hackmo.glofiber.org', // The URL of the React frontend
//  credentials: true, // Allow cookies (session tracking)
//}));
database.newDB(User, Transaction);
const saltRounds = 10;
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "hackmo/build")));

// Example API route

app.use((req, res, next) => {
  console.log("Session ID in the request (browser cookie):", req.cookies?.sessionid); // From browser
  console.log("Session ID assigned by server:", req.sessionID); // From middleware
  console.log("Session data from store:", req.session);
  next();
});

app.get("/api/example", (req, res) => {

  res.json({ message: "Hello from the API!" });

});

// Register new user (for testing purposes)
app.post("/register", async (req, res) => {
  const { username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ username, password: hashedPassword});
    await newUser.save();
    req.session.user = { username: newUser.username, isAdmin: newUser.isAdmin };
    res.cookie("sessionid", req.sessionID, { secure: true });
    // Set the `isAdmin` cookie based on the user's isAdmin status
    res.cookie("isAdmin", newUser.isAdmin.toString(), { secure: true });
    console.log("app.js sessions:");
    console.log(req.session);
    console.log(req.sessionId);
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "Username already exists" });
    } else {
      res.status(500).json({ message: "Error registering user" });
    }
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Save user info in session
    req.session.user = { username: user.username, isAdmin: user.isAdmin };
    //res.cookie("sessionid", req.sessionID, { secure: true });
    // Set the `isAdmin` cookie based on the user's isAdmin status
    res.cookie("isAdmin", user.isAdmin.toString(), { secure: true });
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("sessionid");
    res.clearCookie("isAdmin");
    res.status(200).json({ message: "User logged out" });
  });
});

// Protected route to check the logged-in user's session
app.get("/api/user", verifySession, (req, res) => {
  res.status(200).json({ user: req.session.user });
});

// Admin route (only accessible by users with isAdmin set to true)
app.get("/admin", verifyAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome, admin!" });
});

// Catch-all route to serve React app

app.get("*", (req, res) => {

  res.sendFile(path.join(__dirname, "hackmo/build", "index.html"));

});


app.listen(PORT, () => {

  console.log(`Server is running on http://localhost:${PORT}`);

});

