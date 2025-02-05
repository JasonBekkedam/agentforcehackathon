const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing
app.use(express.json());

// ===== In-Memory Storage for Proof-of-Concept =====

// Store filters as an array of objects
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

// Store parameters as an array of objects
let parameters = [
	{
		parameterName: "Param1",
		parameterValue: "Value1",
	},
	{
		parameterName: "Param2",
		parameterValue: "Value2",
	},
];

// GET /updates => returns both filters and parameters
app.get("/updates", (req, res) => {
	res.json({ filters, parameters });
});

// POST /updates => updates filters and/or parameters
// Expect the client to send an object like:
// { filters: [ ... ], parameters: [ ... ] }
app.post("/updates", (req, res) => {
	const { filters: newFilters, parameters: newParameters } = req.body;

	if (newFilters) {
		// Ensure we always store an array
		filters = Array.isArray(newFilters) ? newFilters : [newFilters];
	}

	if (newParameters) {
		// Ensure we always store an array
		parameters = Array.isArray(newParameters)
			? newParameters
			: [newParameters];
	}

	res.json({ status: "updated", filters, parameters });
});

// ===== Serve React Build =====
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// ===== Start the Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
