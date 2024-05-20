import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import PasswordReset from "components/password-reset/PasswordReset";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "redux/authSlice";
import { TUserInfo } from "types/userInfo";
import axiosRequest from "utils/axios";
import { emailSchema, passwordSchema } from "utils/validationSchemas";
import { object } from "yup";
import Register from "./Register";

type Form = {
	email: string;
	password: string;
	apiError?: any;
};

type LoginProps = {
	token?: string;
};

type LoginResponse = {
	token: string;
};

const Login = ({ token }: LoginProps) => {
	const dispatch = useDispatch();
	const { showModal, closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);

	useLayoutEffect(() => {
		if (!token) return;
		setLoading(true);
		validateToken();
	}, []);

	const validateToken = async () => {
		const response = await axiosRequest("POST", "/api/users/register/validate", { token: token });
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error validating token:", response.message.cz);
			closeModal();
			return;
		}
		openSuccessSnackbar("Účet byl úspěšně aktivován!");
		setLoading(false);
	};

	const formSchema = object().shape({
		email: emailSchema,
		password: passwordSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handleLogin = async (data: Form) => {
		const response = await axiosRequest<LoginResponse>("POST", "/api/users/auth/token", { email: data.email, password: data.password });
		if (!response.success) {
			if (response.message.en.includes("Invalid")) {
				setError("password", { type: "user", message: "Nesprávný e-mail nebo heslo" });
			} else {
				setError("apiError", { type: "server", message: "Někde nastala chyba zkuste to znovu" });
			}
			console.error("Error logging in:", response.message.cz);
			openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
			return;
		}
		dispatch(setToken({ token: response.data.token, rememberMe: rememberMe }));
		getUserInfo();
		openSuccessSnackbar("Jste úspěšně přihlášen!");
		closeModal();
	};

	const getUserInfo = async () => {
		const response = await axiosRequest<TUserInfo>("GET", "/api/users/user");
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error getting user info:", response.message.cz);
			return;
		}
		const newUserInfo: TUserInfo = {
			id: response.data.id,
			email: response.data.email,
			is_staff: response.data.is_staff,
		};
		dispatch(setUser({ userInfo: newUserInfo, rememberMe: rememberMe }));
	};

	return (
		<form className="login" onSubmit={handleSubmit(handleLogin)}>
			{loading ? (
				<LoadingScreen login />
			) : (
				<>
					<h1>Přihlásit se</h1>
					<label>E-mail:</label>
					<input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder="Zadejte e-mail..." {...register("email")} />
					<p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
					<label>Heslo:</label>
					<input type="password" className={`${errors.password ? "border-red-600" : ""}`} placeholder="Zadejte heslo..." {...register("password")} />
					<p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
					<div className="footer">
						<div className="remember-me">
							<input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
							<label onClick={() => setRememberMe(!rememberMe)}>Zapamatovat si mě</label>
						</div>
						<span className="password-reset-label" onClick={() => showModal(<PasswordReset />)}>
							Zapomenuté heslo
						</span>
					</div>
					{errors.apiError && <p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>}
					<div className="buttons">
						<Button color="secondary" type="button" onClick={() => showModal(<Register />)}>
							Zaregistrovat se
						</Button>
						<Button type="submit" color="accent">
							Přihlásit se
						</Button>
					</div>
				</>
			)}
		</form>
	);
};

export default Login;
