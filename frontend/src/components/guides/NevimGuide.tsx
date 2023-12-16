import { useState } from "react";

const NevimGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <h2 onClick={() => setOpen(!open)}>aaaaaa</h2>
      {open && (
        <ol>
          <li>Klikněte na vyhledávání (lupa nebo start)</li>
          <li>Napište do vyhledávácího pole &quot;Výstřižky&quot;</li>
          <li>Zapněte program Výstřižky</li>
          <div className="image">
            <img src="/src/images/guides/Sreenshot1.png" alt="screenshot1" />
            <p>Klikněte na &quot;+ Nový&quot;</p>
          </div>
          <li>Vyberte oblast, kterou chcete zachytit</li>
          <li>Vpravo nahoře klikněte na tlačítko diskety (Uložit jako)</li>
        </ol>
      )}
    </div>
  );
};

export default NevimGuide;
