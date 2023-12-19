import { useState } from "react";

const LookAtIssues = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <h2 onClick={() => setOpen(!open)}>
        Jak zkontrolovat pohledávky/issues?
      </h2>
      {open && (
        <ol>
          <li></li>
        </ol>
      )}
    </div>
  );
};

export default LookAtIssues;
