import { useState } from "react";

const AddComment = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak přidat komentář v Issues?</h2>
			{open && (
				<ol>
					<li></li>
				</ol>
			)}
		</div>
	);
};

export default AddComment;
