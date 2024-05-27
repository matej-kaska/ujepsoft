import { useState } from "react";

const DetailedIssue = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak upravit Issue?</h2>
			{open && (
				<ol>
					<li>
						Na stránce <a href="/issues">Issues</a> si vyberete chtěnný Issue a rozkliknete 
					</li>{" "}
					<div className="image">
						<img src="/src/images/guides/issuedetailed.webp" alt="issues" />
					</div>
				</ol>
			)}
		</div>
	);
};

export default DetailedIssue;
