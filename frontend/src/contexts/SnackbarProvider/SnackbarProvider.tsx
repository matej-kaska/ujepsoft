import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { closeSnackbar as closeReduxSnackbar } from "../../redux/snackbarSlice";
import ErrorSnackbar from "./ErrorSnackbar";
import SuccessSnackbar from "./SuccessSnackbar";

type SnackbarContextType = {
	openSuccessSnackbar: (msg: string, long?: boolean) => void;
	openErrorSnackbar: (msg: string, long?: boolean) => void;
	openInfoSnackbar: (msg: string, long?: boolean) => void;
	closeSnackbar: () => void;
	forceCloseSnackbar: () => void;
};

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
	const dispatch = useDispatch();
	const reduxSnackbarState = useSelector((state: RootState) => state.snackbar);
	const [open, setOpen] = useState<boolean>(false);
	const [fade, setFade] = useState("fade-in");
	const [message, setMessage] = useState<string>("");
	const [type, setType] = useState<"success" | "info" | "error">("success");
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [firstLoad, setFirstLoad] = useState<boolean>(true);

	useEffect(() => {
		if (firstLoad) {
			setFirstLoad(false);
			return;
		}
		if (reduxSnackbarState.open) {
			if (reduxSnackbarState.type === "success") {
				openSuccessSnackbar(reduxSnackbarState.message);
			} else if (reduxSnackbarState.type === "info") {
				openInfoSnackbar(reduxSnackbarState.message);
			} else {
				openErrorSnackbar(reduxSnackbarState.message);
			}
		} else {
			closeSnackbar();
		}
	}, [reduxSnackbarState]);

	const openSnackbar = (msg: string, type: "success" | "info" | "error", long?: boolean) => {
		setType(type);
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
		openSnackbar(msg, "error", long);
	};

	const openInfoSnackbar = (msg: string, long?: boolean) => {
		openSnackbar(msg, "info", long);
	};

	const openSuccessSnackbar = (msg: string, long?: boolean) => {
		openSnackbar(msg, "success", long);
	};

	const closeSnackbar = (long?: boolean) => {
		setFade("fade-out");
		if (long) {
			setTimeout(() => {
				setOpen(false);
				setMessage("");
				setType("success");
				dispatch(closeReduxSnackbar());
			}, 30000);
		} else {
			setTimeout(() => {
				setOpen(false);
				setMessage("");
				setType("success");
				dispatch(closeReduxSnackbar());
			}, 300);
		}
		setTimeout(() => {
			setFade("fade-in");
		}, 300);
	};

	const forceCloseSnackbar = () => {
		setOpen(false);
		setMessage("");
		setType("success");
		dispatch(closeReduxSnackbar());
	};

	return (
		<SnackbarContext.Provider value={{ openSuccessSnackbar, openErrorSnackbar, openInfoSnackbar, closeSnackbar, forceCloseSnackbar }}>
			{children}
			{open && (type === "success" ? <SuccessSnackbar message={message} closeSnackbar={forceCloseSnackbar} fade={fade} /> : type === "error" ? <ErrorSnackbar message={message} closeSnackbar={forceCloseSnackbar} fade={fade} /> : <SuccessSnackbar message={message} closeSnackbar={forceCloseSnackbar} fade={fade} />)}
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
