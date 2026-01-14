const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from dist if it exists, otherwise from public
const fs = require("fs");
const distPath = path.join(__dirname, "dist");
const publicPath = path.join(__dirname, "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log("[server.js] Serving static files from ./dist");
} else {
  app.use(express.static(publicPath));
  console.log("[server.js] Serving static files from ./public");
}

// Root route renders index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Fallback for other routes (optional: could render 404 or redirect)
// Fallback for unmatched routes
app.use((req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});
