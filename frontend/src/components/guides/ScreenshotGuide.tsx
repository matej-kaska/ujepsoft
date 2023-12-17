import { useState } from "react";

const ScreenshotGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <h2 onClick={() => setOpen(!open)}>Jak udělat screenshot? (Windows)</h2>
      {open && (
        <ol>
          <li>Klikněte na vyhledávání (lupa nebo start)</li>
          <li>Napište do vyhledávácího pole &quot;Výstřižky&quot;</li>
          <li>Zapněte program Výstřižky</li>
          <div className="image">
            <img src="/src/images/guides/screenshot.png" alt="screenshot" />
            <p>Klikněte na &quot;+ Nový&quot;</p>
          </div>
          <li>Vyberte oblast, kterou chcete zachytit</li>
          <li>Vpravo nahoře klikněte na tlačítko diskety (Uložit jako)</li>
        </ol>
      )}
    </div>
  );
};

export default ScreenshotGuide;
