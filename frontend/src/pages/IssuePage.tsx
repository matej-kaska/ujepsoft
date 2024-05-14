import Comment from "components/comment/Comment";
import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
import Label from "components/label/Label";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import NewComment from "components/new-comment/NewComment";
import NewIssue from "components/new-issue/NewIssue";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { FullIssue } from "types/issue";
import axiosRequest from "utils/axios";
import { formatDescription, removeFooterFromBody } from "utils/plainTextToHtml";
import { ReactComponent as DoneIcon } from "../images/done-icon.svg";
import { ReactComponent as EditIcon } from "../images/edit-icon.svg";

const IssuePage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { id } = useParams();
	const { showModal, closeModal } = useModal();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const reload = useSelector((state: RootState) => state.reload);
	const [issue, setIssue] = useState<FullIssue>({} as FullIssue);
	const [loading, setLoading] = useState<boolean>(true);

	useLayoutEffect(() => {
		getIssue();
	}, [id]);

	useEffect(() => {
		if (!reload.location || reload.location !== "issuepage") return;
		getIssue();
		dispatch(setReload(""));
	}, [reload]);

	const getIssue = async () => {
		if (Object.keys(issue).length === 0) setLoading(true);
		const response = await axiosRequest<FullIssue>("GET", `/api/issue/${id}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error getting issue:", response.message.cz);
			navigate("/issues");
			return;
		}
		if (response.data.body) response.data.body = removeFooterFromBody(response.data.body);
		setIssue(response.data);
		setLoading(false);
	};

	const removeIssue = async () => {
		closeModal();
		const response = await axiosRequest("DELETE", `/api/issue/${id}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error deleting issue:", response.message.cz);
			return;
		}
		openSuccessSnackbar("Issue byl úspěšně uzavřen!");
		navigate("/issues");
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
										{((userInfo.is_staff && issue.author === import.meta.env.VITE_GITHUB_USERNAME) || userInfo.email === issue.author_ujepsoft) && <EditIcon className="edit-icon" onClick={() => showModal(<NewIssue issue={issue} />)} />}
										{issue.state !== "closed" ? <DoneIcon className="done-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete uzavřít issue?"} actionOnClick={removeIssue} submitText={"Uzavřít"} />)} /> : <span className="closed">(uzavřené)</span>}
									</>
								)}
							</div>
							<ProfileBadge name={issue.author} profilePicture={issue.author_profile_pic} authorUjepsoft={issue.author_ujepsoft} />
							<h2 className="repo">Aplikace: {issue.repo.name}</h2>
						</header>
						{issue.labels.length > 0 && (
							<div className="labels">
								{issue.labels.map((label, index) => {
									return <Label label={label} key={index} />;
								})}
							</div>
						)}
						<div className="dates">
							<span>Vytvořeno: {new Date(issue.created_at).toLocaleDateString("cs-CZ")}</span>
							<span>Naposledy aktualizováno: {new Date(issue.updated_at).toLocaleDateString("cs-CZ")}</span>
						</div>
						<section className="description-wrapper">
							<h2>Popis Issue:</h2>
							<div className="description html-inner" dangerouslySetInnerHTML={{ __html: formatDescription(issue?.body || "", true) || "<p><span class='no-description'>Není zde popis</span></p>" }} />
						</section>
						<Files files={issue.files.filter((file) => file.file_type === "file")} />
						<Images images={issue.files.filter((file) => file.file_type === "image")} />
						<section className="comments-wrapper">
							<h2>Komentáře:</h2>
							{issue.comments
								.sort((a, b) => {
									const dateA = new Date(a.created_at);
									const dateB = new Date(b.created_at);
									return dateA.getTime() - dateB.getTime();
								})
								.map((comment) => {
									return <Comment key={comment.id} issueId={issue.id} {...comment} />;
								})}
						</section>
						<NewComment issueId={issue.id} />
					</>
				)}
			</div>
		</>
	);
};

export default IssuePage;
