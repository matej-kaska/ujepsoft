import { useState } from "react";

const AddComment = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak přidat komentář k Issue?</h2>
			{open && (
				<ol>
					<li>
						Na stránce <a href="/issues">Issues</a> si vyberete chtěný Issue a rozkliknete pomocí tlačítka nebo nadpisu.
					</li>
					<div className="image">
						<img src="/src/images/guides/editissue.webp" alt="editissue" />
					</div>
					<td>&nbsp;</td>
					<li>Poté se zobrazí detailní informace Issue a na spodní straně stránky naleznete pole s komentářem.</li>
					<div className="image">
						<img src="/src/images/guides/addcomment.webp" alt="addcomment" />
						<ul>
							<strong>1</strong> &rarr; Místo pro sepsání komentáře.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Místo pro nahrání případných příloh –⁠⁠⁠⁠⁠⁠ fotky, náčrtky, dokumenty. Velikost max 128MB. Celková velikost max 512MB.
						</ul>
						<ul>
							<strong>1</strong> &rarr; Tlačítko pro potvrzení přidání komentáře.
						</ul>
					</div>
				</ol>
			)}
		</div>
	);
};

export default AddComment;
