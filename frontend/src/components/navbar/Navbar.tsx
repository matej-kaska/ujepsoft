import Button from "components/buttons/Button";
import { Link } from "react-router-dom";
import { useModal } from "contexts/ModalProvider";
import Login from "components/authetication/Login";
import { useSelector } from "react-redux";
import { store } from "redux/store";
import { removeUser } from "redux/authSlice";
import axios from "utils/axios";
import { useSnackbar } from "contexts/SnackbarProvider";

const Navbar = () => {
  const { showModal } = useModal();
  const { openSnackbar } = useSnackbar();
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  const handleLogout = () => {
    store.dispatch(removeUser());
    axios.defaults.headers.common['Authorization'] = '';
    openSnackbar("Byl jste úspěšně odhlášen!");
  };

  return (
    <nav className="navbar">
      <header className="header">
        <Link to={"/"}><h1>UJEP SOFT</h1></Link>
        <div className="img-wrapper">
          <Link to={"https://ujep.cz/"}><img src="/src/images/ujep-full-logo.png" alt="UJEP logo" /></Link>
        </div>
      </header>
      <div className="bottom-wrapper">
        <ul>
          <li><Link to={"/"}>Nabídky</Link></li>
          <li><Link to={"/issues"}>Pohledávky</Link></li>
          <li><Link to={"/guides"}>Návody</Link></li>
        </ul>
        <div className="user-wrapper">
          {userInfo.id ? 
            <>
              <span>Jste přihlášen jako {userInfo.email}</span>
              <Button onClick={handleLogout} color="secondary">Odhlásit se</Button>
            </>
          :
            <Button onClick={() => showModal(<Login/>)}>Přihlásit se</Button>
          }
        </div>
      </div>
    </nav>
  );
};

export default Navbar;