import React, { useState, useEffect, useCallback } from "react";

function App() {
	const [initialized, setInitialized] = useState(false);
	const [filters, setFilters] = useState([]);
	const [parameters, setParameters] = useState([]);
	const [highlights, setHighlights] = useState([]);

	// Helper to get a worksheet by name synchronously using the worksheets property
	const getWorksheet = useCallback(async (worksheetName) => {
		const dashboard = window.tableau.extensions.dashboardContent.dashboard;
		// Use the synchronous property "worksheets" instead of getWorksheetsAsync()
		const worksheets = dashboard.worksheets;
		return worksheets.find((ws) => ws.name === worksheetName);
	}, []);

	// Apply a filter using the Tableau Extensions API
	const applyFilter = useCallback(
		async (worksheetName, fieldName, values) => {
			try {
				const dashboard =
					window.tableau.extensions.dashboardContent.dashboard;
				const worksheet = dashboard.worksheets.find(
					(ws) => ws.name === worksheetName
				);
				if (worksheet) {
					await worksheet.applyFilterAsync(
						fieldName,
						values,
						window.tableau.FilterUpdateType.Replace
					);
					console.log(
						`Filter applied on ${worksheetName} for ${fieldName}: ${values}`
					);
				} else {
					console.error(
						`Worksheet ${worksheetName} not found for filtering.`
					);
				}
			} catch (err) {
				console.error("Error applying filter:", err);
			}
		},
		[]
	);

	// Update a parameter using the Tableau Extensions API
	const applyParameter = useCallback(
		async (parameterName, parameterValue) => {
			try {
				const dashboard =
					window.tableau.extensions.dashboardContent.dashboard;
				const parameter = await dashboard.findParameterAsync(
					parameterName
				);
				if (parameter) {
					await parameter.changeValueAsync(parameterValue);
					console.log(
						`Parameter ${parameterName} updated to ${parameterValue}`
					);
				} else {
					console.error(`Parameter ${parameterName} not found.`);
				}
			} catch (err) {
				console.error(
					`Error updating parameter ${parameterName}:`,
					err
				);
			}
		},
		[]
	);

	// Highlight marks using selectMarksAsync per Tableau's recommendations
	const applyHighlight = useCallback(
		async (worksheetName, fieldName, values) => {
			try {
				const worksheet = await getWorksheet(worksheetName);
				if (worksheet) {
					if (typeof worksheet.selectMarksAsync === "function") {
						await worksheet.selectMarksAsync(
							fieldName,
							values,
							window.tableau.SelectionUpdateType.Replace
						);
						console.log(
							`Highlight applied on ${worksheetName} for ${fieldName}: ${values}`
						);
					} else {
						console.error(
							`selectMarksAsync is not available on worksheet "${worksheetName}". Ensure that this worksheet supports mark selection and that your Tableau version is current.`
						);
					}
				} else {
					console.error(
						`Worksheet ${worksheetName} not found for highlighting.`
					);
				}
			} catch (err) {
				console.error("Error applying highlight:", err);
			}
		},
		[getWorksheet]
	);

	// Initialize the Tableau extension
	useEffect(() => {
		window.tableau.extensions
			.initializeAsync()
			.then(() => {
				console.log("Tableau Extension initialized.");
				setInitialized(true);
			})
			.catch((err) => {
				console.error("Error initializing extension:", err);
			});
	}, []);

	// Poll the server for updates (filters, parameters, and highlights)
	useEffect(() => {
		if (initialized) {
			const interval = setInterval(async () => {
				try {
					const response = await fetch("/updates");
					if (response.ok) {
						const data = await response.json();
						const newFilters = Array.isArray(data.filters)
							? data.filters
							: [];
						const newParameters = Array.isArray(data.parameters)
							? data.parameters
							: [];
						const newHighlights = Array.isArray(data.highlights)
							? data.highlights
							: [];

						setFilters(newFilters);
						setParameters(newParameters);
						setHighlights(newHighlights);

						// Apply filters concurrently
						await Promise.all(
							newFilters.map((filter) =>
								applyFilter(
									filter.worksheetName,
									filter.filterField,
									filter.filterValues
								)
							)
						);

						// Apply parameters concurrently
						await Promise.all(
							newParameters.map((param) =>
								applyParameter(
									param.parameterName,
									param.parameterValue
								)
							)
						);

						// Apply highlights concurrently
						await Promise.all(
							newHighlights.map((highlight) =>
								applyHighlight(
									highlight.worksheetName,
									highlight.highlightField,
									highlight.highlightValues
								)
							)
						);
					}
				} catch (error) {
					console.error("Error fetching updates:", error);
				}
			}, 5000); // Poll every 5 seconds

			return () => clearInterval(interval);
		}
	}, [initialized, applyFilter, applyParameter, applyHighlight]);

	return (
		<div style={{ padding: 20 }}>
			<h2>Tableau React Extension Proof of Concept</h2>
			{initialized ? (
				<div>
					<div>
						<h3>Filters:</h3>
						<ul>
							{filters.map((filter, index) => (
								<li key={index}>
									<strong>{filter.worksheetName}</strong> -{" "}
									{filter.filterField}:{" "}
									{JSON.stringify(filter.filterValues)}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3>Parameters:</h3>
						<ul>
							{parameters.map((param, index) => (
								<li key={index}>
									<strong>{param.parameterName}</strong>:{" "}
									{JSON.stringify(param.parameterValue)}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3>Highlights:</h3>
						<ul>
							{highlights.map((highlight, index) => (
								<li key={index}>
									<strong>{highlight.worksheetName}</strong> -{" "}
									{highlight.highlightField}:{" "}
									{JSON.stringify(highlight.highlightValues)}
								</li>
							))}
						</ul>
					</div>
				</div>
			) : (
				<p>Initializing extension...</p>
			)}
		</div>
	);
}

export default App;
