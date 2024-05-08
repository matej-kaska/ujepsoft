import { yupResolver } from "@hookform/resolvers/yup";
import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import { useForm } from "react-hook-form";
import { emailSchema } from "utils/validationSchemas";
import * as yup from "yup";
import { useModal } from "../../contexts/ModalProvider";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import axios from "../../utils/axios";

type Form = {
	email: string;
	apiError?: any;
};

const PasswordReset = () => {
	const { showModal, closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();

	const formSchema = yup.object().shape({
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

	const handleLogin = () => {
		showModal(<Login />);
	};

	const handleReset = (data: Form) => {
		axios
			.post("/api/users/request-reset-password", {
				email: data.email,
			})
			.then(() => {
				openSuccessSnackbar("E-mail byl úspěšně odeslán!");
				closeModal();
			})
			.catch((err) => {
				if (!err.response.data.en) {
					console.error(err);
					setError("apiError", {
						type: "server",
						message: "Někde nastala chyba zkuste to znovu",
					});
					openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				} else if (err.response.data.en.includes("Invalid")) {
					setError("email", {
						type: "server",
						message: err.response.data.cz,
					});
					openErrorSnackbar(`${err.response.data.cz}!`);
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
		<form className="password-reset" onSubmit={handleSubmit(handleReset)}>
			<h1>Zapomenuté heslo</h1>
			<label>E-mail:</label>
			<input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder="Zadejte e-mail..." {...register("email")} />
			<p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
			<div className="buttons">
				<Button color="secondary" type="button" onClick={handleLogin}>
					Zpět
				</Button>
				<Button type="submit">Odeslat</Button>
			</div>
		</form>
	);
};

export default PasswordReset;
