const express = require("express");
const path = require("path");
const app = express();

// Middleware for JSON body parsing
app.use(express.json());

// ===== In-Memory Storage for Proof-of-Concept =====

// Default state for filters and parameters
const defaultFilters = [
	{
		worksheetName: "Sheet 1",
		filterField: "Category",
		filterValues: [],
	},
	{
		worksheetName: "Sheet 1",
		filterField: "Region",
		filterValues: [],
	},
];

const defaultParameters = [
	{
		parameterName: "Param1",
		parameterValue: "",
	},
	{
		parameterName: "Param2",
		parameterValue: "",
	},
];

// In-memory storage – start with some defaults.
let filters = JSON.parse(JSON.stringify(defaultFilters));
let parameters = JSON.parse(JSON.stringify(defaultParameters));

// GET /updates => returns filters and parameters
app.get("/updates", (req, res) => {
	res.json({ filters, parameters });
});

// POST /updates => updates filters and/or parameters
// Expected JSON format:
// {
//   "filters": [ { worksheetName, filterField, filterValues }, ... ],
//   "parameters": [ { parameterName, parameterValue }, ... ]
// }
app.post("/updates", (req, res) => {
	const { filters: newFilters, parameters: newParameters } = req.body;

	if (newFilters) {
		filters = Array.isArray(newFilters) ? newFilters : [newFilters];
	}
	if (newParameters) {
		parameters = Array.isArray(newParameters)
			? newParameters
			: [newParameters];
	}

	res.json({ status: "updated", filters, parameters });
});

// POST /reset => resets filters and parameters to their default values
app.post("/reset", (req, res) => {
	filters = JSON.parse(JSON.stringify(defaultFilters));
	parameters = JSON.parse(JSON.stringify(defaultParameters));
	res.json({ status: "reset", filters, parameters });
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
