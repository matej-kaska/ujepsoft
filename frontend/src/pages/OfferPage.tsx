import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
import Keyword from "components/keyword/Keyword";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { Offer } from "types/offer";
import axiosRequest from "utils/axios";
import { formatDescription } from "utils/plainTextToHtml";
import EditIcon from "images/edit-icon.svg?react";
import RemoveIcon from "images/remove-icon.svg?react";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "utils/const";

const NewOffer = lazy(() => import("components/new-offer/NewOffer"));

const OfferPage = () => {
	const { id } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { showModal, closeModal } = useModal();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const reload = useSelector((state: RootState) => state.reload);
	const [offer, setOffer] = useState<Offer>({} as Offer);
	const [loading, setLoading] = useState<boolean>(true);

	useLayoutEffect(() => {
		getOffer();
	}, [id]);

	useEffect(() => {
		if (!reload.location || reload.location !== "offerpage") return;
		getOffer();
		dispatch(setReload(""));
	}, [reload]);

	const getOffer = async () => {
		setLoading(true);
		const response = await axiosRequest<Offer>("GET", `/api/offer/${id}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error getting offer:", response.message.cz);
			navigate("/");
			return;
		}
		setOffer(response.data);
		setLoading(false);
	};

	const removeOffer = async () => {
		closeModal();
		const response = await axiosRequest("DELETE", `/api/offer/${id}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error deleting offer:", response.message.cz);
			return;
		}
		openSuccessSnackbar("Nabídka byla úspěšně smazána!");
		navigate("/");
	};

	const editOffer = () => {
		showModal(
			<Suspense fallback={<LoadingScreen modal />}>
				<NewOffer offer={offer} />
			</Suspense>
		);
	};

	return (
		<>
			<Helmet>
				<link rel="canonical" href={websiteUrl + "/offer/" + id} />
			</Helmet>
			<Navbar />
			<div className="offer-page">
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						<header>
							<div className="header-buttons">
								<h1>{offer.name}</h1>
								{(userInfo.is_staff || Number(userInfo.id) === offer.author.id) && (
									<>
										<button className="edit-button" onClick={editOffer}><EditIcon/></button>
										<button className="remove-button" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat nabídku?"} actionOnClick={removeOffer} />)}><RemoveIcon/></button>
									</>
								)}
							</div>
							<h2>{offer.author.email}</h2>
						</header>
						<div className="keywords">
							<span className="keywords-span">Klíčová slova:</span>
							{offer.keywords.map((keyword, index) => {
								return <Keyword keyword={keyword} key={index} />;
							})}
						</div>
						<Files files={offer.files.filter((file) => file.file_type === "file")} />
						<section className="description-wrapper">
							<h2>Popis nabídky:</h2>
							<div className="description html-inner lists" dangerouslySetInnerHTML={{ __html: formatDescription(offer.description) || "<p></p>" }} />
						</section>
						<Images images={offer.files.filter((file) => file.file_type === "image")} />
					</>
				)}
			</div>
		</>
	);
};

export default OfferPage;
