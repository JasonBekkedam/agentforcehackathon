const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing
app.use(express.json());

// ===== In-Memory Filter Storage for Proof-of-Concept =====
// Instead of a single filter, we now store an array of filters.
// You can pre-populate with multiple filters if desired.
let filters = [
	{
		worksheetName: "Sheet 1",
		filterField: "Category",
		filterValues: ["Furniture"],
	},
	{
		worksheetName: "Sheet 1",
		filterField: "Region",
		filterValues: ["East"],
	},
];

// GET /filters => returns the current filter criteria (an array of filter objects)
app.get("/filters", (req, res) => {
	res.json(filters);
});

// POST /filters => updates the current filter criteria
// Expect the client to send an array of filter objects.
app.post("/filters", (req, res) => {
	filters = req.body; // e.g. [ { worksheetName, filterField, filterValues }, ... ]
	res.json({ status: "updated", newFilters: filters });
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
