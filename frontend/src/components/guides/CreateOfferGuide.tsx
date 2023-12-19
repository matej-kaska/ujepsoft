import { useState } from "react";

const CreateOfferGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <h2 onClick={() => setOpen(!open)}>Jak vytvořit nabídku?</h2>
      {open && (
        <ol>
          <li>
            Na úvodní stránce <a href="/">Ujepsoft</a>
          </li>
          <div className="image">
            <img src="/src/images/guides/createoffer1.png" alt="createoffer1" />
            Klikněte na tlačítko &quot;+ Přidat nabídku&quot;
          </div>
          <li>Objeví se tabulka pro vyplnění nabídky</li>
          <div className="image">
            <img src="/src/images/guides/createoffer2.png" alt="createoffer2" />
            <ul>
              <strong>1</strong> &rarr; Název nabídky
              <i> (&quot;Aplikace pro zjištění počasí&quot;)</i>; nutno vyplnit.
            </ul>
            <ul>
              <strong>2</strong> &rarr; Klíčová slova jsou určena k tomu, aby
              zaujala programátora; není nutno vyplňovat.
            </ul>
            <ul>
              <strong>3</strong> &rarr; Důkladný popis aplikace/programu. Proč
              je aplikace potřebná, jaká jsou očekávání, atd.
            </ul>
            <ul>
              <strong>4</strong> &rarr;
            </ul>
            <ul>
              <strong>5</strong> &rarr;
            </ul>
          </div>
        </ol>
      )}
    </div>
  );
};

export default CreateOfferGuide;
