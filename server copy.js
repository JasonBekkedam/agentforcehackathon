const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing (for POST requests)
app.use(express.json());

// ===== In-Memory Filter Storage for Proof-of-Concept =====
let currentFilter = {
	worksheetName: "Sheet 1",
	filterField: "Category",
	filterValues: ["Furniture"],
};

// ===== Simple REST endpoints =====

// GET /filters => returns the current filter criteria
app.get("/filters", (req, res) => {
	res.json(currentFilter);
});

// POST /filters => updates the current filter criteria
app.post("/filters", (req, res) => {
	currentFilter = req.body; // e.g. { worksheetName, filterField, filterValues }
	res.json({ status: "updated", newFilter: currentFilter });
});

// ===== Serve React build =====
app.use(express.static(path.join(__dirname, "client", "build")));

// For any other route, serve index.html
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// ===== Start the server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
