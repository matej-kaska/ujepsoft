import { useState } from "react";

const LookAtIssues = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>
				Jak se orientovat v pohledávkách/issues?
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
							<strong>3</strong> &rarr; Autor issue.
						</ul>
						<ul>
							<strong>4</strong> &rarr; Obsah pohledávky/issue - obrázky jsou k
							vidění přímo na GitHub stránce.
						</ul>
						<ul>
							<strong>5</strong> &rarr; Počet komentářů k aktuální
							pohledávce/issue.
						</ul>
						<ul>
							<strong>6</strong> &rarr; Datum vytvoření pohledávky/issue.
						</ul>
						<ul>
							<strong>7</strong> &rarr; Datum poslední aktualizace této
							pohledávky/issue.
						</ul>
						<ul>
							<strong>8</strong> &rarr; Tlačítko pro zobrazení detailních
							informací o pohledávce/issue.
						</ul>
					</div>
				</ol>
			)}
		</div>
	);
};

export default LookAtIssues;
