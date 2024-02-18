import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { confirmPasswordSchema, passwordSchema } from "utils/validationSchemas";
import * as yup from "yup";
import { useModal } from "../../contexts/ModalProvider";
import { useSnackbar } from "../../contexts/SnackbarProvider";

type ChangePasswordProps = {
	token: string;
};

type Form = {
	password: string;
	passwordConf: string;
	apiError?: any;
};

const ChangePassword = ({ token }: ChangePasswordProps) => {
	const { closeModal, showModal } = useModal();
	const { openSnackbar, openErrorSnackbar } = useSnackbar();
	const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState<boolean>(false);

	const formSchema = yup.object().shape({
		password: passwordSchema,
		passwordConf: confirmPasswordSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handleChange = (data: Form) => {
		axios
			.post("/api/users/reset-password", {
				new_password: data.password,
				new_password_again: data.passwordConf,
				code: token,
			})
			.then(() => {
				openSnackbar("Heslo bylo úspěšně změněno!");
				setIsSuccessfullySubmitted(true);
				setTimeout(() => {
					showModal(<Login />);
				}, 750);
			})
			.catch((err) => {
				if (!err.response.data) {
					console.error(err);
					setError("apiError", {
						type: "server",
						message: "Někde nastala chyba zkuste to znovu",
					});
					openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				} else if (err.response.status === 404) {
					setError("apiError", {
						type: "server",
						message: "Tento odkaz již není platný",
					});
					openErrorSnackbar("Tento odkaz již není platný!");
					closeModal();
				} else {
					console.error(err);
					setError("apiError", {
						type: "server",
						message: "Někde nastala chyba zkuste to znovu",
					});
					openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				}
			});
	};

	return (
		<form className="change-password" onSubmit={handleSubmit(handleChange)}>
			<h1>Změnit heslo</h1>
			<label>Heslo:</label>
			<input className={`${errors.password ? "border-red-600" : ""}`} type="password" placeholder="Zadejte heslo..." {...register("password")} />
			<p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
			<label>Heslo znovu:</label>
			<input className={`${errors.passwordConf ? "border-red-600" : ""}`} type="password" placeholder="Zadejte heslo znovu..." {...register("passwordConf")} />
			{!isSuccessfullySubmitted && <p className={`${errors.passwordConf ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.passwordConf?.message}!</p>}
			{isSuccessfullySubmitted && <p className="ml-0.5 text-sm font-medium text-green-600 successfullySubmitted">Heslo bylo úspěšně změněno.</p>}
			<div className="buttons">
				<Button color={"secondary"} type="button" onClick={closeModal}>
					Zavřít
				</Button>
				<Button type="submit">Změnit</Button>
			</div>
		</form>
	);
};

export default ChangePassword;
