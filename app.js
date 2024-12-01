const express = require("express");

const path = require("path");


const app = express();

const PORT = process.env.PORT || 4000;


// Serve static files from the React app

app.use(express.static(path.join(__dirname, "hackmo/build")));


// Example API route

app.get("/api/example", (req, res) => {

  res.json({ message: "Hello from the API!" });

});


// Catch-all route to serve React app

app.get("*", (req, res) => {

  res.sendFile(path.join(__dirname, "hackmo/build", "index.html"));

});


app.listen(PORT, () => {

  console.log(`Server is running on http://localhost:${PORT}`);

});

