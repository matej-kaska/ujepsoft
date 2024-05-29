import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import GeneralModal from "components/general-modal/GeneralModal";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "redux/store";
import { Repo } from "types/repo";
import axiosRequest from "utils/axios";
import { urlGithubSchema } from "utils/validationSchemas";
import { object } from "yup";
import { ReactComponent as RemoveIcon } from "../images/remove-icon.svg";
import useWindowSize from "utils/useWindowSize";

type AddRepoForm = {
	url: string;
	apiError?: string;
};

const AdministrationPage = () => {
	const navigate = useNavigate();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const { showModal, closeModal } = useModal();
	const windowSize = useWindowSize();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const [loadedRepos, setLoadedRepos] = useState<Repo[]>([]);
	const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
	const [isNarrow, setIsNarrow] = useState<boolean>(false);

	useEffect(() => {
		if (windowSize[0] > 450) {
			setIsNarrow(false);
			return;
		}
		setIsNarrow(true);
	}, [windowSize[0]]);

	useEffect(() => {
		if (!userInfo.is_staff) navigate("/");
		loadRepos();
	}, []);

	const addRepoFormSchema = object().shape({
		url: urlGithubSchema,
	});

	const {
		setError,
		setValue,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AddRepoForm>({
		resolver: yupResolver(addRepoFormSchema),
	});

	const loadRepos = async () => {
		const response = await axiosRequest<Repo[]>("GET", "/api/repo/list");
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading repos:", response.message.cz);
			navigate("/");
			return;
		}
		setLoadedRepos(response.data);
		setLoading(false);
	};

	const addRepo = async (data: AddRepoForm) => {
		setSuccessfullySubmitted(false);
		setLoadingAdd(true);
		const response = await axiosRequest("POST", "/api/repo", { url: data.url });
		if (!response.success) {
			setLoadingAdd(false);
			setError("apiError", { type: "server", message: response.message.cz });
			console.error("Error adding repo:", response.message.cz);
			return;
		}
		setSuccessfullySubmitted(true);
		setLoadingAdd(false);
		setValue("url", "");
		loadRepos();
	};

	const removeRepo = async (repoId: number) => {
		closeModal();
		const response = await axiosRequest("DELETE", `/api/repo/${repoId}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error deleting repo:", response.message.cz);
			return;
		}
		openSuccessSnackbar("Repozitář byl úspěšně smazán z databáze!");
		loadRepos();
	};

	return (
		<>
			<Navbar />
			<section className="administration-page">
				<header>
					<h1>Administrace UJEP SOFT</h1>
					<p>
						Sekce Administrace slouží pro správu repozitářů, které lze přidávat a odebírat. Repozitáře se objeví pouze pokud je personál UJEP collaborantem.
					</p>
				</header>
				<section className="repos-wrapper">
					<form className="add-new" onSubmit={handleSubmit(addRepo)}>
						<h2>Přidat nový repozitář</h2>
						<div className="input-wrapper">
							<input type="text" {...register("url")} onChange={() => successfullySubmitted && setSuccessfullySubmitted(false)}/>
							<Button className="add-button" type="submit">
								+ Přidat
							</Button>
						</div>
						<div className="loading-status">
							{loadingAdd ? (
								<>
									<LoadingScreen />
									<p className="loading-p">
										Přidávání repozitáře do databáze...
									</p>
								</>
							) : (
								<>
									<p className={`${errors.url || errors.apiError ? "visible" : "invisible"} text-sm text-red-600`}>
										{errors.url ? errors.url.message : errors.apiError?.message}!
									</p>
									<p className={`${successfullySubmitted ? "visible" : "invisible"} text-sm text-green-600 success`}>
										Repozitář byl úspěšně přidán do databáze!
									</p>
								</>
							)}
						</div>
					</form>
					<section className="repos-list-wrapper">
						<h2>Seznam repozitářů</h2>
						<ul className="repos-list">
							{loading ? (
								<div className="flex flex-row items-center">
									<LoadingScreen upper />
									<span className="ml-3 text-gray-600 italic">
										Načítání repozitářů a zjišťování statusu collaboranta
									</span>
								</div>
							) : (
								<>
									{loadedRepos && loadedRepos.length === 0 && (
										<li className="ml-0.5 text-gray-600 italic">
											Žádné repozitáře nebyly nalezeny
										</li>
									)}
									{loadedRepos?.map((repo, index) => (
										<li key={index} className="repo">
											{!isNarrow && (
												<ProfileBadge name={repo.author} profilePicture={repo.author_profile_pic}/>
											)}
											<span className="repo-name">{repo.name}</span>
											{!isNarrow && (
												<Link to={repo.url} target="_blank" rel="noopener noreferrer">
													URL odkaz
												</Link>
											)}
											<RemoveIcon className="remove-icon" onClick={() =>showModal(<GeneralModal text={"Opravdu chcete smazat repozitář z databáze?"} actionOnClick={() => removeRepo(repo.id)}/>)}/>
											{!repo.collaborant && (
												<span className="text-red-700">
													UJEP není collaborantem repozitáře!
												</span>
											)}
										</li>
									))}
								</>
							)}
						</ul>
					</section>
				</section>
			</section>
		</>
	);
};

export default AdministrationPage;
