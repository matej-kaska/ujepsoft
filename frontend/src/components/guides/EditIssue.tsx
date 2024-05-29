import { useState } from "react";

const EditIssue = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak upravit Issue?</h2>
			{open && (
				<ol>
					<li>
						Na stránce <a href="/issues">Issues</a> si vyberete chtěný Issue a rozkliknete pomocí tlačítka nebo nadpisu.
					</li>
					<div className="image">
						<img src="/src/images/guides/editissue.webp" alt="editissue" />
					</div>
					<td>&nbsp;</td>
					<li>
						Po rozkliknutí se vám zobrazí bližší informace o Issue.
					</li>
					<div className="image">
						<img src="/src/images/guides/editissue2.webp" alt="editissue2" />
						<ul>
							<strong>1</strong> &rarr; Úprava Issue - viz návod <i> (&quot;Jak založit Issue?&quot;)</i>. Lze upravit veškeré informace.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Uzavření Issue - pokud je daný problém vyřešen.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Přidané soubory k Issue.
						</ul>
					</div>
				</ol>
			)}
		</div>
	);
};

export default EditIssue;
