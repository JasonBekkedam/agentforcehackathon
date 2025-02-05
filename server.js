const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing (for POST requests)
app.use(express.json());

// ===== In-Memory Filter Storage for Proof-of-Concept =====
// Always store filters as an array.
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

// GET /filters => returns an array of filter objects
app.get("/filters", (req, res) => {
	res.json(filters);
});

// POST /filters => expects an array of filter objects and updates the filters
app.post("/filters", (req, res) => {
	// Option A: Enforce that the request body is an array (return an error if not)
	/*
	if (!Array.isArray(req.body)) {
		return res.status(400).json({ error: "Request body must be an array of filters." });
	}
	*/

	// Option B: If the request body is not an array, wrap it in an array.
	// Uncomment the following line if you want to accept a single filter object.
	filters = Array.isArray(req.body) ? req.body : [req.body];

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
