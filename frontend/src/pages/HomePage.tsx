import Login from "components/authetication/Login";
import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewOffer from "components/new-offer/NewOffer";
import ChangePassword from "components/password-reset/ChangePassword";
import UnitOffer from "components/unit-offer/UnitOffer";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { Offer } from "types/offer";
import axiosRequest from "utils/axios";
import { getOffersRowAmount } from "utils/getUnitsRowAmount";

type OffersResponse = {
	next: string;
	results: Offer[];
};

const HomePage = () => {
	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();
	const { openErrorSnackbar } = useSnackbar();
	const { showModal } = useModal();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const reload = useSelector((state: RootState) => state.reload);
	const [offers, setOffers] = useState<Offer[]>([]);
	const [next, setNext] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [loaded, setLoaded] = useState<boolean>(false);

	useLayoutEffect(() => {
		setLoaded(true);
		getOffers();
	}, []);

	useEffect(() => {
		if (!reload.location || reload.location !== "offers") return;
		getOffers();
		dispatch(setReload(""));
	}, [reload]);

	const getOffers = async () => {
		setLoading(true);
		const pageAmount = getOffersRowAmount() * 2;
		const response = await axiosRequest<OffersResponse>(
			"GET",
			`/api/offer/list?page-size=${pageAmount}`,
		);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading offers:", response.message.cz);
			return;
		}
		setOffers(response.data.results);
		setNext(response.data.next);
		setLoading(false);
	};

	const getMoreOffers = async () => {
		setLoading(true);
		const response = await axiosRequest<OffersResponse>("GET", next);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading more offers:", response.message.cz);
			return;
		}
		setOffers((prev) => [...prev, ...response.data.results]);
		setNext(response.data.next);
		setLoading(false);
	};

	useEffect(() => {
		if (!searchParams) return;
		const token: string | null = searchParams?.get("token");
		const registration: string | null = searchParams?.get("registration");
		if (token) showModal(<ChangePassword token={token} />);
		if (registration) showModal(<Login token={registration} />);
	}, [loaded]);

	return (
		<>
			<Navbar />
			<div className="homepage">
				<header>
					<h1>Nabídky pro vývoj softwaru na UJEP</h1>
					<p>
						Personál UJEP má možnost navrhovat softwarové projekty, které jsou
						zapotřebí vyvinout. Studenti mohou na tyto nabídky reagovat a
						zapojit se do vývoje posíláním svých nápadů na uvedený e-mail. Jedná
						se o skvělou příležitost k získání praktických zkušeností a
						spolupráci mezi studenty a personálem.
					</p>
					{userInfo?.id && (
						<Button color="accent" onClick={() => showModal(<NewOffer />)}>
							+ Přidat nabídku
						</Button>
					)}
				</header>
				{offers.length === 0 && !loading ? (
					<span className="mt-4 text-gray-600 italic no-issues">
						Nejsou zde žádné nabídky
					</span>
				) : (
					<section className="offer-container">
						{offers.map((offer: Offer, index: number) => (
							<UnitOffer offer={offer} key={index} />
						))}
					</section>
				)}
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						{next && (
							<Button color="accent" onClick={getMoreOffers}>
								Načíst další
							</Button>
						)}
					</>
				)}
			</div>
		</>
	);
};

export default HomePage;
