import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useAuth } from "contexts/AuthProvider";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "redux/authSlice";
import { RootState, store } from "redux/store";
import { clearAxiosAuthorization } from "utils/axios";

const Navbar = () => {
	const navigate = useNavigate();
	const { showModal } = useModal();
	const { openSuccessSnackbar } = useSnackbar();
	const { checkIsLoggedIn } = useAuth();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);

	const handleLogout = () => {
		navigate("/");
		store.dispatch(removeUser());
		clearAxiosAuthorization();
		openSuccessSnackbar("Byl jste úspěšně odhlášen!");
	};

	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		checkIsLoggedIn(Boolean(userInfo.id));
		if (!userInfo.id) e.preventDefault();
	};

	return (
		<nav className="navbar">
			<header className="header">
				<Link to={"/"}>
					<h1>UJEP SOFT</h1>
				</Link>
				<div className="img-wrapper">
					<Link to={"https://ujep.cz/"}>
						<img src="/src/images/ujep-full-logo.webp" alt="UJEP logo" />
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
							Problémy/Úkoly (Issues)
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
							<span>Jste přihlášen jako {userInfo.email}</span>
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
