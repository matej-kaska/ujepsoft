import { useState } from "react";

const CreateIssueGuide = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>navod</h2>
			{open && (
				<ol>
					<li></li>
				</ol>
			)}
		</div>
	);
};

export default CreateIssueGuide;
