import Button from "components/buttons/Button";
import "./Navbar.scss";
import { Link } from "react-router-dom";

const Navbar = () => {
  const loggedIn = true;

  return (
    <nav className="navbar">
      <header className="header">
        <Link to={"/"}><h1>UJEP SOFT</h1></Link>
        <div className="img-wrapper">
          <img src="/src/images/ujep-full-logo.png" alt="UJEP logo" />
        </div>
      </header>
      <div className="bottom-wrapper">
        <ul>
          <li><Link to={"/"}>Nabídky</Link></li>
          <li><Link to={"/issues"}>Pohledávky</Link></li>
          <li><Link to={"/guides"}>Návody</Link></li>
        </ul>
        <div className="user-wrapper">
          {loggedIn ? 
            <>
              <span>Jste přihlášen jako {loggedIn}</span>
              <Button onClick={() => {}} color="secondary">Odhlásit se</Button>
            </>
          :
            <Button onClick={() => {}}>Přihlásit se</Button>
          }
        </div>
      </div>
    </nav>
  );
};

export default Navbar;