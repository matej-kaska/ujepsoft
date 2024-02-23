import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Attachment from "components/attachment/Attachment";
import GeneralModal from "components/general-modal/GeneralModal";
import Keyword from "components/keyword/Keyword";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewOffer from "components/new-offer/NewOffer";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { Offer } from "types/offer";
import axios from "utils/axios";
import { formatDescription } from "utils/plainTextToHtml";
import { ReactComponent as EditIcon } from "../images/edit-icon.svg";
import { ReactComponent as RemoveIcon } from "../images/remove-icon.svg";

const OfferPage = () => {
	const { id } = useParams();
	const { showModal, closeModal } = useModal();
	const { openErrorSnackbar, openSnackbar } = useSnackbar();
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const dispatch = useDispatch();
	const reload = useSelector((state: any) => state.reload);
	const [loading, setLoading] = useState<boolean>(true);
	const [offer, setOffer] = useState<Offer>({} as Offer);
	const [filesOpen, setFilesOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		getOffer();
	}, [id]);

	useEffect(() => {
		if (!reload.location || reload.location !== "offerpage") return;
		getOffer();
		dispatch(setReload(""));
	}, [reload]);

	const getOffer = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`/api/offer/${id}`);
			if (!response.data) return;
			setOffer(response.data);
			setLoading(false);
		} catch {
			navigate("/");
		}
	};

	const removeOffer = async () => {
		closeModal();
		try {
			await axios.delete(`/api/offer/${id}`);
			openSnackbar("Nabídka byla úspěšně smazána!");
			navigate("/");
		} catch (error) {
			openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
			console.error("Error deleting offer:", error);
		}
	};

	return (
		<>
			<Navbar />
			<div className="offer-page">
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						<header>
							<div className="header-buttons">
								<h1>{offer.name}</h1>
								{(userInfo.is_staff || userInfo.id === offer.author.id) && (
									<>
										<EditIcon className="edit-icon" onClick={() => showModal(<NewOffer offer={offer} />)} />
										<RemoveIcon className="remove-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat nabídku?"} actionOnClick={removeOffer} />)} />
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
						{offer.files.length > 0 && (
							<section className="files-wrapper">
								<div className="show-more" onClick={() => setFilesOpen(!filesOpen)}>
									<span>Zobrazit přílohy ({offer.files.length})</span>
									{filesOpen ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
								</div>
								{filesOpen && (
									<div className="files">
										{offer.files.map((file, index) => {
											return <Attachment attachment={file} key={index} />;
										})}
									</div>
								)}
							</section>
						)}
						<section className="description-wrapper">
							<h2>Popis nabídky:</h2>
							<div className="description" dangerouslySetInnerHTML={{ __html: formatDescription(offer.description) || "<p></p>" }} />
						</section>
					</>
				)}
			</div>
		</>
	);
};

export default OfferPage;
