import { useState } from "react";

const navod = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}></h2>
			{open && (
				<ol>
					<li></li>
				</ol>
			)}
		</div>
	);
};

export default navod;