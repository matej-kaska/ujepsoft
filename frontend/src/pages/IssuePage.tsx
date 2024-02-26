import Comment from "components/comment/Comment";
import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
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
import { FullIssue } from "types/issue";
import axios from "utils/axios";
import { formatDescription, removeFooterFromBody } from "utils/plainTextToHtml";
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
	const [issue, setIssue] = useState<FullIssue>({} as FullIssue);
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
			console.log(response.data);
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
										<RemoveIcon className="remove-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete uzavřít issue?"} actionOnClick={removeIssue} />)} />
									</>
								)}
							</div>
							<ProfileBadge name={issue.author} profilePicture={issue.author_profile_pic} authorUjepsoft={issue.author_ujepsoft} />
							<h2 className="repo">
								Aplikace: {issue.repo.name} <span className="repo-author">({issue.repo.author})</span>
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
							<span>Naposledy aktualizováno: {new Date(issue.updated_at).toLocaleDateString("cs-CZ")}</span>
						</div>
						<section className="description-wrapper">
							<h2>Popis Issue:</h2>
							<div className="description html-inner" dangerouslySetInnerHTML={{ __html: formatDescription(issue?.body || "") || "<p><span class='no-description'>Není zde popis</span></p>" }} />
						</section>
						<Files files={issue.files.filter((file) => file.file_type === "file")} />
						<Images images={issue.files.filter((file) => file.file_type === "image")} />
						<section className="comments-wrapper">
							<h2>Komentáře:</h2>
							{issue.comments.map((comment, index) => {
								return <Comment key={index} {...comment} />;
							})}
						</section>
						<section className="new-comment-wrapper">
							<div>add comment</div>
						</section>
					</>
				)}
			</div>
		</>
	);
};

export default IssuePage;
