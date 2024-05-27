import { useState } from "react";

const LookAtIssues = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>
				Jak se orientovat v Issues?
			</h2>
			{open && (
				<ol>
					<li>
						Na stránce <a href="/issues">Issues</a> se objeví pole viz obrázek.
					</li>{" "}
					<div className="image">
						<img src="/src/images/guides/issues.webp" alt="issues" />
						<ul>
							<strong>1</strong> &rarr; Název Issue.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Jméno vlastníka + název repozitáře,
							kterého se tento Issue týká.
						</ul>
						<ul>
							<strong>3</strong> &rarr; Autor Issue.
						</ul>
						<ul>
							<strong>4</strong> &rarr; Označení Issue - chyba/vylepšení/otázka.
						</ul>
						<ul>
							<strong>5</strong> &rarr; Podrobný popis Issue.
						</ul>
						<ul>
							<strong>6</strong> &rarr; Počet komentářů k aktuálnímu Issue.
						</ul>
						<ul>
							<strong>7</strong> &rarr; Datum vytvoření pohledávky/issue.
						</ul>
						<ul>
							<strong>8</strong> &rarr; Datum poslední aktualizace této
							pohledávky/issue.
						</ul>
						<ul>
							<strong>9</strong> &rarr; Tlačítko pro zobrazení detailních
							informací o Issue.
						</ul>
					</div>
				</ol>
			)}
		</div>
	);
};

export default LookAtIssues;
