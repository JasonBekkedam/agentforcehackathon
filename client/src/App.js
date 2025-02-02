import React, { useEffect } from "react";

function App() {
	useEffect(() => {
		// Check if 'window.tableau.extensions' is available
		if (window.tableau?.extensions) {
			console.log("Tableau Extensions API is loaded and available!");
		} else {
			console.warn(
				"Tableau Extensions API is not detected in this environment."
			);
		}
	}, []);

	return (
		<div style={{ padding: 20 }}>
			<h2>Tableau React Extension</h2>
			<p>
				Check the console for logs regarding the Tableau Extensions API.
			</p>
		</div>
	);
}

export default App;
