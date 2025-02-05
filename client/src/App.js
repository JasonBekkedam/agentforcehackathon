import React, { useState, useEffect } from "react";

function App() {
	const [initialized, setInitialized] = useState(false);
	const [filters, setFilters] = useState([]); // now stores an array of filter objects

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

	useEffect(() => {
		// Initialize the Tableau extension
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

	// Poll the server for filter updates
	useEffect(() => {
		if (initialized) {
			const interval = setInterval(async () => {
				try {
					const response = await fetch("/filters");
					if (response.ok) {
						const data = await response.json(); // expecting an array of filter objects
						setFilters(data);
						// Apply all filters concurrently:
						await Promise.all(
							data.map((filter) =>
								applyFilter(
									filter.worksheetName,
									filter.filterField,
									filter.filterValues
								)
							)
						);
					}
				} catch (error) {
					console.error("Error fetching filters:", error);
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
					<p>Extension is initialized. Current filters:</p>
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
			) : (
				<p>Initializing extension...</p>
			)}
		</div>
	);
}

export default App;
