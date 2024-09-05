import { yupResolver } from "@hookform/resolvers/yup";
import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosRequest from "utils/axios";
import { confirmPasswordSchema, passwordSchema } from "utils/validationSchemas";
import { object } from "yup";
import { useModal } from "../../contexts/ModalProvider";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import CloseIcon from "images/close.svg?react";

type Form = {
	password: string;
	passwordConf: string;
	apiError?: any;
};

type ChangePasswordProps = {
	token: string;
};

const ChangePassword = ({ token }: ChangePasswordProps) => {
	const { closeModal, showModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState<boolean>(false);

	const formSchema = object().shape({
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

	const handleChange = async (data: Form) => {
		const response = await axiosRequest("POST", "/api/users/reset-password", {
			new_password: data.password,
			new_password_again: data.passwordConf,
			code: token,
		});
		if (!response.success) {
			setError("apiError", { type: "server", message: response.message.cz });
			openErrorSnackbar(response.message.cz);
			console.error("Error changing password:", response.message.cz);
		}
		openSuccessSnackbar("Heslo bylo úspěšně změněno!");
		setIsSuccessfullySubmitted(true);
		setTimeout(() => {
			showModal(<Login />);
		}, 750);
	};

	return (
		<form className="change-password" onSubmit={handleSubmit(handleChange)}>
			<header className="modal-header">
				<h1>Změnit heslo</h1>
				<CloseIcon className="close-icon" onClick={() => closeModal()} />
			</header>
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
