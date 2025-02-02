import React, { useEffect, useState } from "react";

function App() {
	const [initialized, setInitialized] = useState(false);
	const [filterInfo, setFilterInfo] = useState(null);

	// Helper function to apply the filter in Tableau
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
		// Initialize the extension once the DOM is loaded
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

	// Poll the server for filter updates, for demonstration
	useEffect(() => {
		if (initialized) {
			const interval = setInterval(async () => {
				try {
					const response = await fetch("/filters");
					if (response.ok) {
						const data = await response.json();
						setFilterInfo(data);
						// Apply the filter using the Extension API
						await applyFilter(
							data.worksheetName,
							data.filterField,
							data.filterValues
						);
					}
				} catch (error) {
					console.error("Error fetching filters:", error);
				}
			}, 5000); // check every 5 seconds

			return () => clearInterval(interval);
		}
	}, [initialized]);

	return (
		<div style={{ padding: 20 }}>
			<h2>Tableau React Extension Proof of Concept</h2>
			{initialized ? (
				<p>
					Extension is initialized. Current filter:{" "}
					{JSON.stringify(filterInfo)}
				</p>
			) : (
				<p>Initializing extension...</p>
			)}
		</div>
	);
}

export default App;
