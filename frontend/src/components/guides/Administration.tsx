import { useState } from "react";

const Administration = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide lists ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak na správu repozitářů?</h2>
			{open && (
				<ol>
					Na stránce <a href="/repo-administration">Administrace</a> se objeví
					pole &quot;Přidat nový repozitář&quot;.
					<div className="image">
						<img
							src="/src/images/guides/administration.webp"
							alt="administration"
						/>
						<ul>
							<strong>1</strong> &rarr; Vkládá se zde odkaz na GitHub repozitář
							ve formátu viz obrázek.
						</ul>
						<ul>
							<strong>2</strong> &rarr; Tlačítko pro přidání daného repozitáře.
						</ul>
						<ul>
							<strong>3</strong> &rarr; &quot;URL odkaz&quot; slouží pro přesun
							na oficiální stránku repozitáře na GitHubu.
						</ul>
						<ul>
							<strong>4</strong> &rarr; &quot;X&quot; slouží pro odebrání
							příslušného repozitáře z databáze.
						</ul>
					</div>
					<td>&nbsp;</td>
						Pokud je vložen nesprávný odkaz nebo nejste kolaborantem v
						repozitáři, objeví se chybová hláška
						<i>&quot;Nejste collaborantem tohoto repozitáře!&quot;</i>.
					
					<div className="image">
						<img
							src="/src/images/guides/administration2.webp"
							alt="administration"
						/>
					</div>
				</ol>
			)}
		</div>
	);
};

export default Administration;
