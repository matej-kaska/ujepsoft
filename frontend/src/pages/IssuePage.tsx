import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Attachment from "components/attachment/Attachment";
import GeneralModal from "components/general-modal/GeneralModal";
import Label from "components/label/Label";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewIssue from "components/new-issue/NewIssue";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { Issue } from "types/issue";
import axios from "utils/axios";
import { formatDescription } from "utils/plainTextToHtml";
import { ReactComponent as EditIcon } from "../images/edit-icon.svg";
import { ReactComponent as RemoveIcon } from "../images/remove-icon.svg";

const IssuePage = () => {
	const { id } = useParams();
	const { showModal, closeModal } = useModal();
	const { openErrorSnackbar, openSnackbar } = useSnackbar();
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const dispatch = useDispatch();
	const reload = useSelector((state: any) => state.reload);
	const [loading, setLoading] = useState<boolean>(true);
	const [issue, setIssue] = useState<Issue>({} as Issue);
	const [filesOpen, setFilesOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		getIssue();
	}, [id]);

	useEffect(() => {
		if (!reload.location || reload.location !== "issuepage") return;
		getIssue();
		dispatch(setReload(""));
	}, [reload]);

	const getIssue = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`/api/issue/${id}`);
			if (!response.data) return;
			response.data.body = removeFooterFromBody(response.data.body);
			setIssue(response.data);
			setLoading(false);
		} catch {
			navigate("/");
		}
	};

	const removeIssue = async () => {
		closeModal();
		try {
			await axios.delete(`/api/issue/${id}`);
			openSnackbar("Issue byl úspěšně smazán!");
			navigate("/");
		} catch (error) {
			openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
			console.error("Error deleting issue:", error);
		}
	};

	const removeFooterFromBody = (body: string) => {
		const lastPClose = body.lastIndexOf("</p>");
		if (lastPClose === -1) return body;

		const lastPOpen = body.substring(0, lastPClose).lastIndexOf("<p");
		if (lastPOpen === -1) return body;

		return body.substring(0, lastPOpen) + body.substring(lastPClose + 4);
	};

	return (
		<>
			<Navbar />
			<div className="issue-page">
				{loading ? (
					<LoadingScreen upper />
				) : (
					<>
						<header>
							<div className="header-buttons">
								<h1>{issue.title}</h1>
								{(userInfo.is_staff || userInfo.email === issue.author_ujepsoft) && (
									<>
										<EditIcon className="edit-icon" onClick={() => showModal(<NewIssue issue={issue} />)} />
										<RemoveIcon className="remove-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat issue?"} actionOnClick={removeIssue} />)} />
									</>
								)}
							</div>
							<ProfileBadge name={issue.author} profilePicture={issue.author_profile_pic} authorUjepsoft={issue.author_ujepsoft} />
							<h2 className="repo">
								Aplikace: {issue.repo.name} <span className="repo-author">({issue.repo.author})</span>
							</h2>
						</header>
						<div className="labels">
							{issue.labels.map((label, index) => {
								return <Label label={label} key={index} />;
							})}
						</div>
						{issue.files.length > 0 && (
							<section className="files-wrapper">
								<div className="show-more" onClick={() => setFilesOpen(!filesOpen)}>
									<span>Zobrazit přílohy ({issue.files.length})</span>
									{filesOpen ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
								</div>
								{filesOpen && (
									<div className="files">
										{issue.files.map((file, index) => {
											return <Attachment attachment={file} key={index} />;
										})}
									</div>
								)}
							</section>
						)}
						<section className="description-wrapper">
							<h2>Popis nabídky:</h2>
							<div className="description" dangerouslySetInnerHTML={{ __html: formatDescription(issue?.body || "") || "<p></p>" }} />
						</section>
					</>
				)}
			</div>
		</>
	);
};

export default IssuePage;
