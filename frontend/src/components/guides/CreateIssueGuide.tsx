import { useState } from "react";

const CreateIssueGuide = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak založit Issue?</h2>
			{open && (
				<ol>
					<li>Na stránce <a href="/issues">Issues</a> klikněte na tlačítko
						&quot;+ Přidat issue&quot;.</li>
					<div className="image">
						<img
							src="/src/images/guides/createissue.webp"
							alt="createissue"
						/>
						<ul>
							<strong>1</strong> &rarr; Vytvoření Issue.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Filtr pro zobrazování čistě otevřených Issues nebo otevřených i uzavřených zároveň.
						</ul>
					</div>
					<td>&nbsp;</td>
					<li>Po rozkliknutí &quot;+ Přidat issue&quot; se zobrazí tabulka viz níže.</li>
					<div className="image">
						<img
							src="/src/images/guides/createissue2.webp"
							alt="createissue"
						/>
						<ul>
							<strong>1</strong> &rarr; Název Issue <strong>Nutno vyplnit!</strong>
						</ul>
						<ul>
							<strong>2</strong> &rarr; Zvolení aplikace, pro kterou se daný Issue zakládá. <strong>Nutno vyplnit!</strong>
						</ul>
							<ul>
							<strong>3</strong> &rarr; Zaškrtnutí vhodného označení - pomůže programátorům zorientovat se v Issue. <strong>Nutno vyplnit!</strong>
						</ul>
							<ul>
							<strong>4</strong> &rarr; Důkladný popis Issue. <strong>Nutno vyplnit!</strong>
						</ul>
							<ul>
							<strong>5</strong> &rarr; Místo pro nahrání případných příloh –⁠⁠⁠⁠⁠⁠
							fotky, náčrtky, dokumenty. Velikost max 128MB. Celková velikost max 512MB.
						</ul>
							<ul>
							<strong>6</strong> &rarr; Tlačítko pro potvrzení založení
							Issue.
						</ul>
					</div>

				</ol>
			)}
		</div>
	);
};

export default CreateIssueGuide;
