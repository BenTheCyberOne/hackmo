const express = require("express");
const path = require("path");
const EventEmitter = require("events");
//const cookieParser = require("cookie-parser");
require('dotenv').config();
const multer = require('multer');
const upload = multer({
  dest: path.join(__dirname, 'hackmo/public'),
});
const session = require("express-session");
const mongoose = require('mongoose').set('debug', true);
const bcrypt = require("bcrypt");
const mime = require('mime');
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
/*
app.use((req, res, next) => {
  console.log("Session ID in the request (browser cookie):", req.cookies?.sessionid); // From browser
  console.log("Session ID assigned by server:", req.sessionID); // From middleware
  console.log("Session data from store:", req.session);
  next();
});
*/
app.post('/templates/manager', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  res.status(200).json({ message: 'File uploaded successfully.', filename: req.file.filename });
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
    const userExists = await User.findOne({username: username});
    if (userExists){
      return res.status(400).json({ message: "Username already exists" });
    }
    await User.create(newUser);
    console.log("created User:", username);
    req.session.user = { username: newUser.username, isAdmin: newUser.isAdmin };
    res.cookie("sessionid", req.sessionID, { secure: true });
    // Set the `isAdmin` cookie based on the user's isAdmin status
    res.cookie("isAdmin", newUser.isAdmin.toString(), { secure: true });
    //console.log("app.js sessions:");
    //console.log(req.session);
    //console.log(req.sessionId);
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
    res.cookie("sessionid", req.sessionID, { secure: true });
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
app.get("/api/user", verifySession, async (req, res) => {
  try{
    const getUser = await User.findOne({username: req.session.user.username});
    const user = {username: getUser.username, balance: getUser.balance};
    console.log("user:", user)
    res.status(200).json(user);
  }catch(err){
    console.log("messed up DB for sure");
  }
  
});

app.get("/api/transactions", verifySession, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 }); // Sort by 'timestamp' in descending order
    res.status(200).json({ transactions: transactions });
  } catch (err) {
    res.status(500).json({ message: "Something wrong with getting transactions..." });
    console.error(err);
  }
});

// Admin route (only accessible by users with isAdmin set to true)
/*
app.get("/admin", verifyAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome, admin!" });
});
*/

app.get("/user/details/:username", async (req, res) => {
  username = req.params;
  try{
    const user = await User.findOne({username: username});
    if(!user){
      res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({user: user});
  } catch (err){
    res.status(500).json({ message: "Error while loading users" });
    console.error(err);
  }
});

app.get("/imager", (req, res) => {
  const filePath = req.query.file;
  if (!filePath) {
    return res.status(400).json({ error: 'File query parameter is required.' });
  };
  let absPath;
  // Check if the provided path is just a filename (no directory separators)
  if (path.basename(filePath) === filePath) {
    // Serve from the /public directory
    absolutePath = path.resolve(__dirname, 'hackmo/public', filePath);
  } else {
    // Resolve the provided path as an absolute path
    absolutePath = path.resolve(filePath);
  }
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  const mimeType = mime.getType(absolutePath);
  // Handle image files specifically
  if (mimeType && mimeType.startsWith('image/')) {
    res.setHeader('Content-Type', mimeType); // Set the appropriate image MIME type
    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error sending image file:', err);
        res.status(500).json({ error: 'Internal server error.' });
      }
    });
  } else {
    // Send non-image files as-is
    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Internal server error.' });
      }
    });
  }
});

const transactionEmitter = new EventEmitter();
const userEmitter = new EventEmitter();

app.get("/api/stream/transactions", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  //res.setHeader("Content-Encoding", "none");

  console.log("Client connected to SSE stream");
  //res.write('\n');
  // Function to send data to the client
  const sendTransaction = (transaction) => {
    console.log('tran-stream:',transaction);
    res.write(`data: ${JSON.stringify(transaction)}\n\n`);
  };

   // Send a keep-alive message every 5 seconds to prevent timeouts
  const keepAliveInterval = setInterval(() => {
    res.write("data: keep-alive\n\n");
  }, 5000); // Sends keep-alive message every 5 seconds
  // Listen for new transactions and send them to the client
  transactionEmitter.on("newTransaction", sendTransaction);

  // Handle client disconnection
  req.on("close", () => {
    console.log("Client disconnected from SSE stream");
    clearInterval(keepAliveInterval);
    transactionEmitter.removeListener("newTransaction", sendTransaction);
    res.end();
  });
});

app.get("/api/stream/user", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  //res.flushHeaders();
  //res.setHeader("Content-Encoding", "identity");

  console.log("Client connected to SSE stream");
  //res.write('\n');
  // Function to send data to the client
  const sendUserData = (userData) => {
    console.log('user-stream:',userData);
    res.write(`data: ${JSON.stringify(userData)}\n\n`);
  };

  // Listen for new transactions and send them to the client
  userEmitter.on("newBalance", sendUserData);

   // Send a keep-alive message every 5 seconds to prevent timeouts
  const keepAliveInterval = setInterval(() => {
    res.write("data: keep-alive\n\n");
  }, 5000); // Sends keep-alive message every 5 seconds

  // Handle client disconnection
  req.on("close", () => {
    console.log("Client disconnected from SSE stream");
    clearInterval(keepAliveInterval);
    userEmitter.removeListener("newBalance", sendUserData);
    res.end();
  });
});

app.post("/send", verifySession, async (req,res) => {
  const {receiverID, amount, balance} = req.body;
  const senderID = req.session.user.username;
  try{
    const recvExists = await User.findOne({username: receiverID});
    if (!recvExists){
       return res.status(400).json({ message: "Error: Receiver does not exist!" });
    }
    if (amount > balance){
      return res.status(401).json({ message: "Error: Not enough in your account!" });
    }
    newBal = balance - amount;
    const check = await User.findOneAndUpdate({username: senderID},{$set: {balance: newBal}});
    if (!check){
      return res.status(500).json({ message: "Something's wrong with the G-Diffuser!" });
    }
    const transaction = new Transaction({timestamp: new Date(), sender: senderID, receiver: receiverID, amount: amount})
    const check2 = await Transaction.create(transaction);
    if (check2){
      console.log("Created Transaction: ",transaction);
      // Emit the transaction to SSE clients
    const newTran = {transactions: transaction}
    transactionEmitter.emit("newTransaction", newTran);
    const balObj = {balance: newBal}
    userEmitter.emit("newBalance", balObj);
    sendBal = recvExists.balance + amount;
    const check3 = await User.findOneAndUpdate({username: receiverID},{$set:{balance: sendBal}})
    res.status(200).json({ message: "successfully sent:",transaction: transaction});
    } else{
       res.status(500).json({ message: "Looks like something went wrong..." });
    }
  } catch(err) {
    res.status(500).json({ message: "Looks like something went really wrong..." });
  }
});

app.post("/admin/send", verifyAdmin, async (req,res) => {
  const {senderID, receiverID, amount} = req.body;
  //const senderID = req.session.user.username;
  try{
    const recvExists = await User.findOne({username: receiverID});
    if (!recvExists){
       return res.status(400).json({ message: "Error: Receiver does not exist!" });
    }
    const sendExists = await User.findOne({username: senderID});
    if (!sendExists){
       return res.status(400).json({ message: "Error: Sender does not exist!" });
    }
    senderCurBal = sendExists.balance;
    if (amount > senderCurBal){
      return res.status(401).json({ message: "Error: Not enough in sender account!" });
    }
    newBal = senderCurBal - amount;
    const check = await User.findOneAndUpdate({username: senderID},{$set: {balance: newBal}});
    if (!check){
      return res.status(500).json({ message: "Something's wrong with the G-Diffuser!" });
    }
    const transaction = new Transaction({timestamp: new Date(), sender: senderID, receiver: receiverID, amount: amount})
    const check2 = await Transaction.create(transaction);
    if (check2){
      console.log("Created Transaction: ",transaction);
      // Emit the transaction to SSE clients
    const newTran = {transactions: transaction}
    transactionEmitter.emit("newTransaction", newTran);
    const balObj = {balance: newBal}
    userEmitter.emit("newBalance", balObj);
    sendBal = recvExists.balance + amount;
    const check3 = await User.findOneAndUpdate({username: receiverID},{$set:{balance: sendBal}})
    res.status(200).json({ message: "successfully sent:",transaction: transaction});
    } else{
       res.status(500).json({ message: "Looks like something went wrong..." });
    }
  } catch(err) {
    res.status(500).json({ message: "Looks like something went really wrong..." });
  }
});

// Catch-all route to serve React app

app.get("*", (req, res) => {

  res.sendFile(path.join(__dirname, "hackmo/build", "index.html"));

});


app.listen(PORT, () => {

  console.log(`Server is running on http://localhost:${PORT}`);

});

