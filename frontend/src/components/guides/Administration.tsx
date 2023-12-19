import { useState } from "react";

const Administration = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <h2 onClick={() => setOpen(!open)}>Jak na správu repozitářů?</h2>
      {open && (
        <ol>
          <li>
            Na stránce <a href="/repo-administration">Administrace</a> se objeví
            pole &quot;Přidat nový repozitář&quot;.
          </li>{" "}
          <div className="image">
            <img
              src="/src/images/guides/administration.png"
              alt="administration"
            />
            <ul>
              <strong>1</strong> &rarr; Vkládá se zde odkaz na GitHub repozitář
              ve formátu viz obrázek.
            </ul>
            <ul>
              <strong>2</strong> &rarr; &quot;URL odkaz&quot; slouží pro přesun
              na oficiální stránku repozitáře na GitHubu.
            </ul>
            <ul>
              <strong>3</strong> &rarr; &quot;X&quot; slouží pro odebrání
              příslušného repozitáře ze seznamu. Dojde i k odebrání repozitáře
              na GitHubu!
            </ul>
          </div>
          <li>
            Pokud je vložen nesprávný odkaz nebo nejste kolaborantem v
            repozitáři, <p />
            objeví se chybová hláška{" "}
            <i>&quot;Nejste collaborantem tohoto repozitáře!&quot;</i>.
          </li>
          <div className="image">
            <img
              src="/src/images/guides/administration2.png"
              alt="administration"
            />
          </div>
        </ol>
      )}
    </div>
  );
};

export default Administration;
