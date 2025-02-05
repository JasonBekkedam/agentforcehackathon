import React, { useState, useEffect } from "react";

function App() {
	const [initialized, setInitialized] = useState(false);
	const [filters, setFilters] = useState([]);
	const [parameters, setParameters] = useState([]);

	// Helper function to apply a filter in Tableau
	async function applyFilter(worksheetName, fieldName, values) {
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
			}
		} catch (err) {
			console.error("Error applying filter:", err);
		}
	}

	// Helper function to update a parameter in Tableau
	// Helper function to update a parameter in Tableau
	async function applyParameter(parameterName, parameterValue) {
		try {
			const dashboard =
				window.tableau.extensions.dashboardContent.dashboard;
			// Retrieve the parameter object by name
			const parameter = await dashboard.findParameterAsync(parameterName);
			if (parameter) {
				// Update the parameter value
				await parameter.changeValueAsync(parameterValue);
				console.log(
					`Parameter ${parameterName} updated to ${parameterValue}`
				);
			} else {
				console.error(`Parameter ${parameterName} not found.`);
			}
		} catch (err) {
			console.error(`Error updating parameter ${parameterName}:`, err);
		}
	}

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

	// Poll the server for updates (both filters and parameters)
	useEffect(() => {
		if (initialized) {
			const interval = setInterval(async () => {
				try {
					const response = await fetch("/updates");
					if (response.ok) {
						const data = await response.json();
						// Destructure updates from the server response.
						const newFilters = Array.isArray(data.filters)
							? data.filters
							: [];
						const newParameters = Array.isArray(data.parameters)
							? data.parameters
							: [];

						setFilters(newFilters);
						setParameters(newParameters);

						// Apply all filters concurrently
						await Promise.all(
							newFilters.map((filter) =>
								applyFilter(
									filter.worksheetName,
									filter.filterField,
									filter.filterValues
								)
							)
						);

						// Apply all parameters concurrently
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
	}, [initialized]);

	return (
		<div style={{ padding: 20 }}>
			<h2>Tableau React Extension Proof of Concept</h2>
			{initialized ? (
				<div>
					<p>Extension is initialized.</p>
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
				</div>
			) : (
				<p>Initializing extension...</p>
			)}
		</div>
	);
}

export default App;
