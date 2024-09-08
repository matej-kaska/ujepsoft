import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useAuth } from "contexts/AuthProvider";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useLayoutEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "redux/authSlice";
import { RootState, store } from "redux/store";
import { clearAxiosAuthorization } from "utils/axios";
import useWindowSize from "utils/useWindowSize";
import OfferIcon from "images/offer-icon.svg?react";
import IssueIcon from "images/issue-icon.svg?react";
import GuideIcon from "images/guide-icon.svg?react";
import AdminIcon from "images/admin-icon.svg?react";
import LogoutIcon from "images/logout-icon.svg?react";

const Navbar = () => {
	const navigate = useNavigate();
	const { showModal } = useModal();
	const { openSuccessSnackbar } = useSnackbar();
	const { checkIsLoggedIn } = useAuth();
	const windowSize = useWindowSize();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [isNarrow, setIsNarrow] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (windowSize[0] > 1060) {
			setIsNarrow(false);
		} else {
			setIsNarrow(true);
		}
		if (windowSize[0] > 820) {
			setIsMobile(false);
		} else {
			setIsMobile(true);
		}
	}, [windowSize[0]]);

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
				{!isMobile &&
					<div className="img-wrapper">
						<Link to={"https://ujep.cz/"}>
							<img src="/src/images/ujep-full-logo.webp" alt="UJEP logo" />
						</Link>
					</div>
				}
			</header>
			<div className="bottom-wrapper">
				<ul>
					<li>
						<Link to={"/"} aria-label="Nabídky">{isMobile ? <OfferIcon/> : "Nabídky"}</Link>
					</li>
					<li>
						<Link to={"/issues"} onClick={handleLinkClick} aria-label="Problémy/Úkoly (Issues)">
							{isMobile ? <IssueIcon/> : "Problémy/Úkoly (Issues)"}
						</Link>
					</li>
					<li>
						<Link to={"/guides"} onClick={handleLinkClick} aria-label="Návody">
							{isMobile ? <GuideIcon/> : "Návody"}
						</Link>
					</li>
					{userInfo.is_staff && (
						<li>
							<Link to={"/repo-administration"} onClick={handleLinkClick} aria-label="Administrace">
								{isMobile ? <AdminIcon/> : "Administrace"}
							</Link>
						</li>
					)}
				</ul>
				<div className="user-wrapper">
					{userInfo.id ? (
						<>
							{!isNarrow && <span>Jste přihlášen jako {userInfo.email}</span>}
							<Button onClick={handleLogout} color="accent" className="logout-button" aria-label="Odhlásit se">
								{isMobile ? <LogoutIcon/> : "Odhlásit se"}
							</Button>
						</>
					) : (
						<Button onClick={() => showModal(<Login />)} className="login-button" aria-label="Přihlásit se">
							Přihlásit se
						</Button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
