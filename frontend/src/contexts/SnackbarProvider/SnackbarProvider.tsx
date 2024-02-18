import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { closeSnackbar as closeReduxSnackbar } from "../../redux/snackbarSlice";
import ErrorSnackbar from "./ErrorSnackbar";
import SuccessSnackbar from "./SuccessSnackbar";

type SnackbarContextType = {
	openSnackbar: (msg: string, error?: boolean, long?: boolean) => void;
	openErrorSnackbar: (msg: string, error?: boolean, long?: boolean) => void;
	closeSnackbar: () => void;
};

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
	const dispatch = useDispatch();
	const reduxSnackbarState = useSelector((state: RootState) => state.snackbar);
	const [open, setOpen] = useState<boolean>(false);
	const [fade, setFade] = useState("fade-in");
	const [message, setMessage] = useState<string>("");
	const [error, setError] = useState<boolean>(false);
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [firstLoad, setFirstLoad] = useState<boolean>(true);

	useEffect(() => {
		if (firstLoad) {
			setFirstLoad(false);
			return;
		}
		if (reduxSnackbarState.open) {
			if (reduxSnackbarState.error) {
				openErrorSnackbar(reduxSnackbarState.message);
			} else {
				openSnackbar(reduxSnackbarState.message);
			}
		} else {
			closeSnackbar();
		}
	}, [reduxSnackbarState]);

	const openSnackbar = (msg: string, error?: boolean, long?: boolean) => {
		if (error) setError(true);
		else setError(false);
		setMessage(msg);
		setOpen(true);

		// Automatically close the snackbar after 4 seconds
		if (timer) clearTimeout(timer);

		setTimer(
			setTimeout(() => {
				closeSnackbar(long);
			}, 4000),
		);
	};

	const openErrorSnackbar = (msg: string, long?: boolean) => {
		openSnackbar(msg, true, long);
	};

	const closeSnackbar = (long?: boolean) => {
		setFade("fade-out");
		if (long) {
			setTimeout(() => {
				setOpen(false);
				setMessage("");
				setError(false);
				dispatch(closeReduxSnackbar());
			}, 30000);
		} else {
			setTimeout(() => {
				setOpen(false);
				setMessage("");
				setError(false);
				dispatch(closeReduxSnackbar());
			}, 300);
		}
		setTimeout(() => {
			setFade("fade-in");
		}, 500);
	};

	return (
		<SnackbarContext.Provider value={{ openSnackbar, openErrorSnackbar, closeSnackbar }}>
			{children}
			{open && (!error ? <SuccessSnackbar message={message} closeSnackbar={closeSnackbar} fade={fade} /> : <ErrorSnackbar message={message} closeSnackbar={closeSnackbar} fade={fade} />)}
		</SnackbarContext.Provider>
	);
};

export const useSnackbar = () => {
	const currentContext = useContext(SnackbarContext);

	if (!currentContext) {
		throw new Error("useSnackbar must be used within SnackbarProvider");
	}

	return currentContext;
};
