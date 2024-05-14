import { yupResolver } from "@hookform/resolvers/yup";
import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useForm } from "react-hook-form";
import axiosRequest from "utils/axios";
import { emailSchema } from "utils/validationSchemas";
import { object } from "yup";

type Form = {
	email: string;
	apiError?: any;
};

const PasswordReset = () => {
	const { showModal, closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();

	const formSchema = object().shape({
		email: emailSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handleReset = async (data: Form) => {
		const response = await axiosRequest("POST", "/api/users/request-reset-password", { email: data.email });
		if (!response.success) {
			if (response.message.en.includes("Invalid")) {
				setError("email", { type: "server", message: response.message.cz });
			} else {
				setError("apiError", { type: "server", message: response.message.cz });
			}
			openErrorSnackbar(response.message.cz);
			console.error("Error sending reset password email:", response.message.cz);
		}
		openSuccessSnackbar("E-mail byl úspěšně odeslán!");
		closeModal();
	};

	return (
		<form className="password-reset" onSubmit={handleSubmit(handleReset)}>
			<h1>Zapomenuté heslo</h1>
			<label>E-mail:</label>
			<input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder="Zadejte e-mail..." {...register("email")} />
			<p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
			<div className="buttons">
				<Button color="secondary" type="button" onClick={() => showModal(<Login />)}>
					Zpět
				</Button>
				<Button type="submit" color="accent">Odeslat</Button>
			</div>
		</form>
	);
};

export default PasswordReset;
