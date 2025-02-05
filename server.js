const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing (for POST requests)
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

// Store highlights as an array of objects
let highlights = [
	{
		worksheetName: "Sheet 1",
		highlightField: "Sub-Category",
		highlightValues: ["Bookcases"],
	},
];

// GET /updates => returns filters, parameters, and highlights
app.get("/updates", (req, res) => {
	res.json({ filters, parameters, highlights });
});

// POST /updates => updates filters, parameters, and/or highlights
// Expects an object like:
// {
//   filters: [ { worksheetName, filterField, filterValues }, ... ],
//   parameters: [ { parameterName, parameterValue }, ... ],
//   highlights: [ { worksheetName, highlightField, highlightValues }, ... ]
// }
app.post("/updates", (req, res) => {
	const {
		filters: newFilters,
		parameters: newParameters,
		highlights: newHighlights,
	} = req.body;

	if (newFilters) {
		filters = Array.isArray(newFilters) ? newFilters : [newFilters];
	}
	if (newParameters) {
		parameters = Array.isArray(newParameters)
			? newParameters
			: [newParameters];
	}
	if (newHighlights) {
		highlights = Array.isArray(newHighlights)
			? newHighlights
			: [newHighlights];
	}

	res.json({ status: "updated", filters, parameters, highlights });
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
