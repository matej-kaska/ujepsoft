import axios from "axios";
import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewIssue from "components/new-issue/NewIssue";
import UnitIssue from "components/unit-issue/UnitIssue";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { setShowClosedIssues } from "redux/settingsSlice";
import { RootState } from "redux/store";
import { Issue } from "types/issue";
import axiosRequest from "utils/axios";
import useWindowSize from "utils/useWindowSize";

type IssuesResponse = {
	next: string;
	results: Issue[];
};

const IssuesPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { showModal } = useModal();
	const { openErrorSnackbar } = useSnackbar();
	const windowSize = useWindowSize();
	const reload = useSelector((state: RootState) => state.reload);
	const showClosedIssues = useSelector((state: RootState) => state.settings.showClosedIssues);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [next, setNext] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const cancelTokenSource = useRef(axios.CancelToken.source());
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (windowSize[0] > 1060) {
			setIsMobile(false);
			return;
		}
		setIsMobile(true);
	}, [windowSize[0]])

	useLayoutEffect(() => {
		getIssues();
	}, []);

	useEffect(() => {
		if (!reload.location || reload.location !== "issues") return;
		getIssues();
		dispatch(setReload(""));
	}, [reload]);

	useEffect(() => {
		getIssues();
		return () => cancelTokenSource.current.cancel("Component unmounted or state changed");
	}, [showClosedIssues]);

	const getIssues = async () => {
		setLoading(true);

		cancelTokenSource.current.cancel("New request initiated");
		cancelTokenSource.current = axios.CancelToken.source();

		try {
			const response = await axiosRequest<IssuesResponse>("GET", `/api/issue/list?closed=${showClosedIssues}`, null, {
				cancelToken: cancelTokenSource.current.token,
			});
			if (!response.success) {
				openErrorSnackbar(response.message.cz);
				console.error("Error loading issues:", response.message.cz);
				navigate("/");
				return;
			}
			setIssues(response.data.results);
			setNext(response.data.next);
			setLoading(false);
		} catch {
			return;
		}
	};

	const getMoreIssues = async () => {
		setLoading(true);
		const response = await axiosRequest<IssuesResponse>("GET", next);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading more issues:", response.message.cz);
			return;
		}
		setIssues([...issues, ...response.data.results]);
		setNext(response.data.next);
		setLoading(false);
	};

	return (
		<>
			<Navbar />
			<div className="issues-page">
				<header>
					<h1>Problémy/Úkoly (Issues)</h1>
					<p>Sekce Problémy/Úkoly (dále jen Issues) slouží k evidenci a správě různých úkolů, chyb, nápadů a dalších záležitostí v rámci softwaru spravovaného univerzitou UJEP. Pokud potřebujete vytvořit nový podnět k některému ze softwarů, klikněte na tlačítko "Přidat issue".</p>
					<div className="footer-header">
						<div className="switch-wrapper">
							<label className="switch" htmlFor="toggle">
								<span className="visually-hidden">Toggle switch</span>
								<input type="checkbox" id="toggle" defaultChecked={!showClosedIssues} onClick={() => dispatch(setShowClosedIssues(!showClosedIssues))} />
								<span className="slider" />
							</label>
							<span className="text">{isMobile ? "Otevřené" : "Nezobrazovat uzavřené"}</span>
						</div>
						<Button color="accent" onClick={() => showModal(<NewIssue />)}>
							+ Přidat issue
						</Button>
						<div className="spacer" />
					</div>
				</header>
				{(issues.length === 0 || (!showClosedIssues ? issues.filter((issue) => issue.state === "closed").length === issues.length : issues.filter((issue) => issue.state === "open").length === issues.length)) && !loading ? (
					<span className="mt-4 text-gray-600 italic no-issues">Nejsou zde žádné issues</span>
				) : (
					<section className="issues-container">
						{issues?.map((issue: Issue, index: number) => {
							if (!showClosedIssues && issue.state === "closed") return;

							return <UnitIssue issue={issue} isMobile={isMobile} key={index} />;
						})}
					</section>
				)}
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						{next && !loading && (
							<Button color="accent" className="load-more" onClick={getMoreIssues}>
								Načíst další
							</Button>
						)}
					</>
				)}
			</div>
		</>
	);
};

export default IssuesPage;
