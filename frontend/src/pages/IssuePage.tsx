import Comment from "components/comment/Comment";
import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
import Label from "components/label/Label";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import Navbar from "components/navbar/Navbar";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { FullIssue } from "types/issue";
import axiosRequest from "utils/axios";
import { formatDescription, removeFooterFromBody } from "utils/plainTextToHtml";
import DoneIcon from "images/done-icon.svg?react";
import EditIcon from "images/edit-icon.svg?react";
import useWindowSize from "utils/useWindowSize";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "utils/const";

const NewIssue = lazy(() => import('components/new-issue/NewIssue'));
const NewComment = lazy(() => import('components/new-comment/NewComment'));

const IssuePage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { id } = useParams();
	const { showModal, closeModal } = useModal();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const windowSize = useWindowSize();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const reload = useSelector((state: RootState) => state.reload);
	const [issue, setIssue] = useState<FullIssue>({} as FullIssue);
	const [loading, setLoading] = useState<boolean>(true);
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (windowSize[0] > 820) {
			setIsMobile(false);
			return;
		}
		setIsMobile(true);
	}, [windowSize[0]]);

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

	const editIssue = () => {
		showModal(
			<Suspense fallback={<LoadingScreen modal />}>
				<NewIssue issue={issue} />
			</Suspense>
		);
	};

	return (
		<>
			<Helmet>
				<link rel="canonical" href={websiteUrl + "/issue/" + id} />
			</Helmet>
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
										{((userInfo.is_staff && issue.author === import.meta.env.VITE_GITHUB_USERNAME) || userInfo.email === issue.author_ujepsoft) && <button className="edit-button" onClick={editIssue}><EditIcon/></button>}
										{issue.state !== "closed" ? <button className="done-button" onClick={() => showModal(<GeneralModal text={"Opravdu chcete uzavřít issue?"} actionOnClick={removeIssue} submitText={"Uzavřít"} />)}><DoneIcon/> </button>: <span className="closed">(uzavřené)</span>}
									</>
								)}
							</div>
							<ProfileBadge name={issue.author} profilePicture={issue.author_profile_pic} authorUjepsoft={issue.author_ujepsoft} />
							<h2 className="repo">
								Aplikace: {issue.repo.author}/{issue.repo.name}
							</h2>
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
							{isMobile ?
								<span>Aktualizováno: {new Date(issue.updated_at).toLocaleDateString("cs-CZ")}</span>
							:
								<span>Naposledy aktualizováno: {new Date(issue.updated_at).toLocaleDateString("cs-CZ")}</span>
							}
						</div>
						<section className="description-wrapper">
							<h2>Popis Issue:</h2>
							<div className="description html-inner lists" dangerouslySetInnerHTML={{ __html: formatDescription(issue?.body || "", true) || "<p><span class='no-description'>Není zde popis</span></p>" }} />
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
						<Suspense fallback={<LoadingScreen upper/>}>
							<NewComment issueId={issue.id} />
						</Suspense>
					</>
				)}
			</div>
		</>
	);
};

export default IssuePage;
