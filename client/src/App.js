import React, { useState, useEffect, useCallback } from "react";

function App() {
	const [initialized, setInitialized] = useState(false);
	const [filters, setFilters] = useState([]);
	const [parameters, setParameters] = useState([]);

	// Helper function to apply a filter using the Tableau Extensions API
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

	// Helper function to update a parameter using the Tableau Extensions API
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

	// Poll the server for updates (filters and parameters)
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

						setFilters(newFilters);
						setParameters(newParameters);

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
					}
				} catch (error) {
					console.error("Error fetching updates:", error);
				}
			}, 5000); // Poll every 5 seconds

			return () => clearInterval(interval);
		}
	}, [initialized, applyFilter, applyParameter]);

	// Function to reset filters by calling the /reset endpoint
	const resetFilters = async () => {
		try {
			const response = await fetch("/reset", { method: "POST" });
			if (response.ok) {
				const data = await response.json();
				console.log("Reset response:", data);
				// Update state with reset filters and parameters
				setFilters(data.filters);
				setParameters(data.parameters);
				// Optionally, immediately apply the reset settings to Tableau:
				await Promise.all(
					data.filters.map((filter) =>
						applyFilter(
							filter.worksheetName,
							filter.filterField,
							filter.filterValues
						)
					)
				);
				await Promise.all(
					data.parameters.map((param) =>
						applyParameter(
							param.parameterName,
							param.parameterValue
						)
					)
				);
			} else {
				console.error(
					"Error resetting filters. Status:",
					response.status
				);
			}
		} catch (error) {
			console.error("Error resetting filters:", error);
		}
	};

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
					<div style={{ marginTop: 20 }}>
						<button onClick={resetFilters}>
							Reset All Filters
						</button>
					</div>
				</div>
			) : (
				<p>Initializing extension...</p>
			)}
		</div>
	);
}

export default App;
