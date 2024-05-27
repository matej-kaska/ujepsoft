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
import { ReactComponent as OfferIcon } from "images/offer-icon.svg";
import { ReactComponent as IssueIcon } from "images/issue-icon.svg";
import { ReactComponent as GuideIcon } from "images/guide-icon.svg";
import { ReactComponent as AdminIcon } from "images/admin-icon.svg";
import { ReactComponent as LogoutIcon } from "images/logout-icon.svg";

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
						<Link to={"/"}>{isMobile ? <OfferIcon/> : "Nabídky"}</Link>
					</li>
					<li>
						<Link to={"/issues"} onClick={handleLinkClick}>
							{isMobile ? <IssueIcon/> : "Problémy/Úkoly (Issues)"}
						</Link>
					</li>
					<li>
						<Link to={"/guides"} onClick={handleLinkClick}>
							{isMobile ? <GuideIcon/> : "Návody"}
						</Link>
					</li>
					{userInfo.is_staff && (
						<li>
							<Link to={"/repo-administration"} onClick={handleLinkClick}>
								{isMobile ? <AdminIcon/> : "Administrace"}
							</Link>
						</li>
					)}
				</ul>
				<div className="user-wrapper">
					{userInfo.id ? (
						<>
							{!isNarrow && <span>Jste přihlášen jako {userInfo.email}</span>}
							<Button onClick={handleLogout} color="accent" className="logout-button">
								{isMobile ? <LogoutIcon/> : "Odhlásit se"}
							</Button>
						</>
					) : (
						<Button onClick={() => showModal(<Login />)} className="login-button">Přihlásit se</Button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
