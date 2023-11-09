import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../redux/store';
import { removeUser } from '../redux/authSlice';
import { openModal } from '../redux/modalSlice';
import { openErrorSnackbar } from '../redux/snackbarSlice';
import Login from '../components/authetication/Login';
import { navigate } from "../redux/navigateSlice";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  userIsNeeded?: boolean;
  redirectLoggedUser?: boolean;
  children: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles, userIsNeeded = false, redirectLoggedUser = false, children }: ProtectedRouteProps) => {
  const dispatch = useDispatch();
  const nativNavigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigateLink = useSelector((state: RootState) => state.navigator.link);

  useEffect(() => {
    const redirectUrls = ["/me", "/lists"];
    if (redirectLoggedUser) {
      nativNavigate("/");
      return;
    }

    // if (userIsNeeded && (!userInfo._id || (allowedRoles && userInfo.role && !allowedRoles.includes(userInfo.role)))) {
    //   // If there's no user logged in or the logged-in user's role is not allowed,
    //   // remove the user information from Redux state and local storage and navigate to login page
    //   dispatch(removeUser());
    //   navigate("/");
    // }

    if (userIsNeeded && !userInfo.id) {
      // If there's no user logged in or the logged-in user's role is not allowed,
      // remove the user information from Redux state and local storage and navigate to login page
      dispatch(removeUser());
      const path = "/" + window.location.pathname.split("/")[1];
      if (redirectUrls.includes(path)) {
        nativNavigate("/");
        return;
      }
    }

    if (!redirectUrls.includes("/" + navigateLink.split("/")[1]) || userInfo.id) {
      if (navigateLink) nativNavigate(navigateLink);
    } else {
      store.dispatch(openErrorSnackbar("Pro tuto akci musíte být přihlášeni"));
      store.dispatch(openModal(<Login />));
      console.warn("You must be logged in to perform this action!")
    }
    dispatch(navigate(""))
  }, [userInfo, userIsNeeded, allowedRoles, redirectLoggedUser, dispatch, navigateLink]);

  // Check if the current route requires a user
  if (!userIsNeeded) {
    return children
  }

  // If a user is required, check if there is a user logged in (userInfo._id is not undefined)
  // And if allowedRoles is defined, check if the logged-in user's role is included in allowedRoles
  /*   if (userInfo._id && (!allowedRoles || (userInfo.role && allowedRoles.includes(userInfo.role)))) {
      return children
    } */

  if (userInfo.id) {
    return children
  }

  // Wait for useEffect to do its work
  return null;
}


export default ProtectedRoute;