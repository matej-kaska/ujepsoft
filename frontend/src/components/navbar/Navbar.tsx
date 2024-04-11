import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useAuth } from "contexts/AuthProvider";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "redux/authSlice";
import { store } from "redux/store";
import axios from "utils/axios";

const Navbar = () => {
	const { showModal } = useModal();
	const { openSnackbar } = useSnackbar();
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const navigate = useNavigate();
	const { checkIsLoggedIn } = useAuth();

	const handleLogout = () => {
		navigate("/");
		store.dispatch(removeUser());
		axios.defaults.headers.common.Authorization = "";
		openSnackbar("Byl jste úspěšně odhlášen!");
	};

	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		checkIsLoggedIn(Boolean(userInfo.id));
		if (!userInfo.id) e.preventDefault();
	};

	return (
		<nav className="navbar">
			<header className="header">
				<Link to={"/"}>
					<h1>UJEP&#8202;&#8202;&#8202;</h1>
					<h1 className="soft-title">SOFT</h1>
				</Link>
				<div className="img-wrapper">
					<Link to={"https://ujep.cz/"}>
						<img src="/src/images/ujep-full-logo.png" alt="UJEP logo" />
					</Link>
				</div>
			</header>
			<div className="bottom-wrapper">
				<ul>
					<li>
						<Link to={"/"}>Nabídky</Link>
					</li>
					<li>
						<Link to={"/issues"} onClick={handleLinkClick}>
							Pohledávky
						</Link>
					</li>
					<li>
						<Link to={"/guides"} onClick={handleLinkClick}>
							Návody
						</Link>
					</li>
					{userInfo.is_staff && (
						<li>
							<Link to={"/repo-administration"} onClick={handleLinkClick}>
								Administrace
							</Link>
						</li>
					)}
				</ul>
				<div className="user-wrapper">
					{userInfo.id ? (
						<>
							<span>Jste přihlášen(a) jako {userInfo.email}</span>
							<Button onClick={handleLogout} color="secondary">
								Odhlásit se
							</Button>
						</>
					) : (
						<Button onClick={() => showModal(<Login />)}>Přihlásit se</Button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
