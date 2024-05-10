import EditComment from "components/edit-comment/EditComment";
import Files from "components/files/Files";
import GeneralModal from "components/general-modal/GeneralModal";
import Images from "components/images/Images";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { ReactComponent as EditIcon } from "images/edit-icon.svg";
import { ReactComponent as RemoveIcon } from "images/remove-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { Comment as TComment } from "types/issue";
import axiosRequest from "utils/axios";
import { formatDescription, removeFooterFromBody } from "utils/plainTextToHtml";

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

	return (
		<div className="comment">
			<div className="comment-header">
				<ProfileBadge name={author} profilePicture={author_profile_pic} authorUjepsoft={author_ujepsoft} />
				{((userInfo.is_staff && author === import.meta.env.VITE_GITHUB_USERNAME) || userInfo.email === author_ujepsoft) && (
					<>
						<EditIcon className="edit-icon" onClick={() => showModal(<EditComment id={id} issueId={issueId} body={body} files={files} />)} />
						<RemoveIcon className="remove-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat komentář?"} actionOnClick={removeComment} submitText={"Smazat"} />)} />
					</>
				)}
			</div>
			<div className="body html-inner" dangerouslySetInnerHTML={{ __html: formatDescription(removeFooterFromBody(body), true) || "" }} />
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
