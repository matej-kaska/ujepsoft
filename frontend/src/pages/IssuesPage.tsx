import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewIssue from "components/new-issue/NewIssue";
import UnitIssue from "components/unit-issue/UnitIssue";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { Issue } from "types/issue";
import axiosRequest from "utils/axios";

type IssuesResponse = {
	next: string;
	results: Issue[];
};

const IssuesPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { showModal } = useModal();
	const { openErrorSnackbar } = useSnackbar();
	const reload = useSelector((state: RootState) => state.reload);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [next, setNext] = useState<string>("");
	const [closed, setClosed] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	useLayoutEffect(() => {
		getIssues();
	}, []);

	useEffect(() => {
		if (!reload.location || reload.location !== "issues") return;
		getIssues();
		dispatch(setReload(""));
	}, [reload]);

	const getIssues = async () => {
		setLoading(true);
		const response = await axiosRequest<IssuesResponse>("GET", "/api/issue/list");
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading issues:", response.message.cz);
			navigate("/");
			return;
		}
		setIssues(response.data.results);
		setNext(response.data.next);
		setLoading(false);
	};

	const getMoreIssues = async () => {
		setLoading(true);
		const response = await axiosRequest<IssuesResponse>("GET", next);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error loading more issues:", response.message.cz);
			return;
		}
		setIssues((prev) => [...prev, ...response.data.results]);
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
								<input type="checkbox" id="toggle" defaultChecked={!closed} onClick={() => setClosed(!closed)} />
								<span className="slider" />
							</label>
							<span className="text">Nezobrazovat uzavřené</span>
						</div>
						<Button color="accent" onClick={() => showModal(<NewIssue />)}>
							+ Přidat issue
						</Button>
						<div className="spacer" />
					</div>
				</header>
				{(issues.length === 0 || (!closed ? issues.filter((issue) => issue.state === "closed").length === issues.length : issues.filter((issue) => issue.state === "open").length === issues.length)) && !loading ? (
					<span className="mt-4 text-gray-600 italic">Nejsou zde žádné issues</span>
				) : (
					<section className="issues-container">
						{issues?.map((issue: Issue, index: number) => {
							if (!closed && issue.state === "closed") return;

							return <UnitIssue issue={issue} key={index} />;
						})}
					</section>
				)}
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						{next && (
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
