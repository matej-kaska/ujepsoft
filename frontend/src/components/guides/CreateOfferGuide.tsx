import { useState } from "react";

const CreateOfferGuide = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak vytvořit nabídku?</h2>
			{open && (
				<ol>
					<li>
						Na úvodní stránce <a href="/">UJEP Soft</a> klikněte na tlačítko
						&quot;+ Přidat nabídku&quot;.
					</li>
					<div className="image">
						<img src="/src/images/guides/createoffer.webp" alt="createoffer1" />
					</div>
					<td>&nbsp;</td>
					<li>Objeví se tabulka pro vyplnění nabídky.</li>
					<div className="image">
						<img
							src="/src/images/guides/createoffer2.webp"
							alt="createoffer2"
						/>
						<ul>
							<strong>1</strong> &rarr; Název nabídky
							<i> (&quot;Aplikace pro zjištění počasí&quot;)</i>. <strong>Nutno vyplnit!</strong>
						</ul>
						<ul>
							<strong>2</strong> &rarr; Klíčová slova jsou určena k tomu, aby
							zaujala programátora. <strong>Nutno vyplnit!</strong>
						</ul>
						<ul>
							<strong>3</strong> &rarr; Důkladný popis aplikace/programu. Proč
							je aplikace potřebná, jaká jsou očekávání atd. <strong>Nutno vyplnit!</strong>
						</ul>
						<ul>
							<strong>4</strong> &rarr; Místo pro nahrání případných příloh –⁠⁠⁠⁠⁠⁠ 
							fotky, náčrtky, dokumenty. Velikost max 128MB. Celková velikost max 512MB.
						</ul>
						<ul>
							<strong>5</strong> &rarr; Tlačítko pro potvrzení vytvoření
							nabídky.
						</ul>
					</div>
				</ol>
			)}
		</div>
	);
};

export default CreateOfferGuide;
