import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axiosRequest from "utils/axios";
import { confirmPasswordSchema, emailSchema, gdprSchema, passwordSchema } from "utils/validationSchemas";
import { object } from "yup";
import Login from "./Login";

type Form = {
	email: string;
	password: string;
	confirmPwd: string;
	gdpr: boolean;
	apiError?: any;
};

const Register = () => {
	const { showModal } = useModal();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState<boolean>(false);

	const formSchema = object().shape({
		email: emailSchema,
		password: passwordSchema,
		confirmPwd: confirmPasswordSchema,
		gdpr: gdprSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handleRegister = async (data: Form) => {
		// TODO: DELETE THIS on Production
		if (!(data.email.endsWith("@ujep.cz") || data.email.endsWith("@gmail.com"))) {
			setError("email", {
				type: "server",
				message: "Tento e-mail nemá doménu @ujep.cz",
			});
			openErrorSnackbar("Tento e-mail nemá doménu @ujep.cz!");
			return;
		}
		const response = await axiosRequest("POST", "/api/users/register", {
			email: data.email,
			password: data.password,
			password_again: data.confirmPwd,
		});
		if (!response.success) {
			if (response.message.en.includes("already taken")) {
				setError("email", {
					type: "server",
					message: "Tento e-mail je již používán",
				});
			} else if (response.message.en.includes("Invalid email")) {
				setError("email", {
					type: "server",
					message: "Tento e-mail nemá doménu @ujep.cz",
				});
			} else {
				setError("apiError", {
					type: "server",
					message: "Někde nastala chyba zkuste to znovu",
				});
			}
			openErrorSnackbar(response.message.cz);
			console.error("Error registering:", response.message.cz);
		}
		setIsSuccessfullySubmitted(true);
		openSuccessSnackbar("Zkontrolujte svůj e-mail pro potvrzení.");
	};

	return (
		<form className="register" onSubmit={handleSubmit(handleRegister)}>
			<h1>Zaregistrovat se</h1>
			<label>E-mail:</label>
			<input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder="Zadejte e-mail..." {...register("email")} />
			<p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
			<label>Heslo:</label>
			<input type="password" className={`${errors.password ? "border-red-600" : ""}`} placeholder="Zadejte heslo..." {...register("password")} />
			<p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
			<label>Heslo znovu:</label>
			<input type="password" className={`${errors.confirmPwd ? "border-red-600" : ""}`} placeholder="Zadejte heslo znovu..." {...register("confirmPwd")} />
			<p className={`${errors.confirmPwd ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.confirmPwd?.message}!</p>
			<div className="gdpr-wrapper-check">
				<input id="gdpr" type="checkbox" {...register("gdpr")} />
				<label htmlFor="gdpr">
					Souhlasím se{" "}
					<Link to={"/gdpr"} target="_blank" rel="noopener noreferrer">
						zpracováním osobních údajů
					</Link>
				</label>
				{!isSuccessfullySubmitted && <p className={`${errors.gdpr ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.gdpr?.message}!</p>}
			</div>
			{isSuccessfullySubmitted && <p className="ml-0.5 font-medium text-sm text-green-600">Zkontrolujte svůj e-mail pro potvrzení.</p>}
			{errors.apiError && <p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>}
			<div className="buttons">
				<Button color="secondary" type="button" onClick={() => showModal(<Login />)}>
					Přihlásit se
				</Button>
				<Button type="submit" color="accent">
					Zaregistrovat se
				</Button>
			</div>
		</form>
	);
};

export default Register;
