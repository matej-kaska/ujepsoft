/** biome-ignore all */

import { useState } from "react";

const navod = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)} />
			{open && (
				<ol>
					<li />
				</ol>
			)}
		</div>
	);
};

export default navod;
