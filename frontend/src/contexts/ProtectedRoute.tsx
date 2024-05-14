import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Login from "../components/authetication/Login";
import { removeUser } from "../redux/authSlice";
import { openModal } from "../redux/modalSlice";
import { navigate } from "../redux/navigateSlice";
import { openErrorSnackbar } from "../redux/snackbarSlice";
import { RootState, store } from "../redux/store";

type ProtectedRouteProps = {
	userIsNeeded?: boolean;
	redirectLoggedUser?: boolean;
	children: JSX.Element;
	userIsStaff?: boolean;
};

const ProtectedRoute = ({ userIsNeeded = false, redirectLoggedUser = false, children, userIsStaff = false }: ProtectedRouteProps) => {
	const dispatch = useDispatch();
	const nativNavigate = useNavigate();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const navigateLink = useSelector((state: RootState) => state.navigator.link);

	useEffect(() => {
		const redirectUrls = ["/guides", "/issues", "/repo-administration", "/issue"];
		if (redirectLoggedUser) {
			nativNavigate("/");
			return;
		}

		if (userIsNeeded && !userInfo.id) {
			dispatch(removeUser());
			const path = `/${window.location.pathname.split("/")[1]}`;
			store.dispatch(openErrorSnackbar("Pro tuto akci musíte být přihlášeni!"));
			store.dispatch(openModal(<Login />));
			console.warn("You must be logged in to perform this action!");
			if (redirectUrls.includes(path)) {
				nativNavigate("/");
				return;
			}
		}

		if (!redirectUrls.includes(`/${navigateLink.split("/")[1]}`) || userInfo.id) {
			if (navigateLink) nativNavigate(navigateLink);
		} else {
			store.dispatch(openErrorSnackbar("Pro tuto akci musíte být přihlášeni"));
			store.dispatch(openModal(<Login />));
			console.warn("You must be logged in to perform this action!");
		}
		dispatch(navigate(""));
	}, [children]);

	if (!userIsNeeded) {
		return children;
	}

	if (userIsStaff && userInfo.id && userInfo.is_staff === true) {
		return children;
	}
	if (userIsStaff) {
		nativNavigate("/");
		return;
	}

	if (userInfo.id) {
		return children;
	}

	return null;
};

export default ProtectedRoute;
