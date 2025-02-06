import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import EditIcon from "images/edit-icon.svg?react";
import RemoveIcon from "images/remove-icon.svg?react";
import { Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "redux/reloadSlice";
import type { RootState } from "redux/store";
import type { Comment as TComment } from "types/issue";
import axiosRequest from "utils/axios";
import { formatDescription, removeFooterFromBody } from "utils/plainTextToHtml";

const EditComment = lazy(() => import("components/edit-comment/EditComment"));

type CommentProps = TComment & {
	issueId: number;
};

const Comment = ({ author, author_profile_pic, author_ujepsoft, body, created_at, updated_at, id, issueId, files }: CommentProps) => {
	const dispatch = useDispatch();
	const { showModal, closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);

	const removeComment = async () => {
		const response = await axiosRequest("DELETE", `/api/issue/${issueId}/comment/${id}`);
		if (!response.success) {
			openErrorSnackbar(response.message.cz);
			console.error("Error deleting comment:", response.message.cz);
			return;
		}
		openSuccessSnackbar("Komentář byl úspěšně smazán!");
		closeModal();
		dispatch(setReload("issuepage"));
	};

	const handleEditComment = () => {
		showModal(
			<Suspense fallback={<LoadingScreen modal />}>
				<EditComment id={id} issueId={issueId} body={body} files={files} />
			</Suspense>,
		);
	};

	return (
		<div className="comment">
			<div className="comment-header">
				<ProfileBadge name={author} profilePicture={author_profile_pic} authorUjepsoft={author_ujepsoft} />
				{((userInfo.is_staff && author === import.meta.env.VITE_GITHUB_USERNAME) || userInfo.email === author_ujepsoft) && (
					<>
						<button className="edit-button" onClick={handleEditComment}>
							<EditIcon />
						</button>
						<button className="remove-button" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat komentář?"} actionOnClick={removeComment} submitText={"Smazat"} />)}>
							<RemoveIcon />
						</button>
					</>
				)}
			</div>
			<div className="body html-inner lists" dangerouslySetInnerHTML={{ __html: formatDescription(removeFooterFromBody(body), true) || "" }} />
			<Files files={files.filter((file) => file.file_type === "file")} />
			<Images images={files.filter((file) => file.file_type === "image")} />
			<div className="footer">
				<span>Vytvořeno: {new Date(created_at).toLocaleDateString("cs-CZ")}</span>
				<span>Naposledy aktualizováno: {new Date(updated_at).toLocaleDateString("cs-CZ")}</span>
			</div>
		</div>
	);
};

export default Comment;
