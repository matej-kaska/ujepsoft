import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useSelector } from "react-redux";
import { Comment as CommentProps } from "types/issue";
import { formatDescription } from "utils/plainTextToHtml";
import { ReactComponent as RemoveIcon } from "images/remove-icon.svg";
import { ReactComponent as EditIcon } from "images/edit-icon.svg";
import { useModal } from "contexts/ModalProvider";
import GeneralModal from "components/general-modal/GeneralModal";
import axios from "axios";
import { useSnackbar } from "contexts/SnackbarProvider";

const Comment = ({ author, author_profile_pic, author_ujepsoft, body, created_at, updated_at, id, number }: CommentProps) => {
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const { showModal, closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();

	const removeComment = async () => {
		try {
			await axios.delete(`/api/comment/${id}`);
			openSuccessSnackbar("Komentář byl úspěšně smazán!");
			closeModal();
		} catch (error: any) {
			if (error.response && error.response.status === 500) {
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
			} else {
				openErrorSnackbar(error.response.data.en || "Někde nastala chyba zkuste to znovu!");
			}
			console.error("Error deleting comment:", error);
		}
	};
	
	return (
		<div className="comment">
			<div className="comment-header">
				<ProfileBadge name={author} profilePicture={author_profile_pic} authorUjepsoft={author_ujepsoft} />
				{((userInfo.is_staff && author === import.meta.env.VITE_GITHUB_USERNAME) || userInfo.email === author_ujepsoft) && (
					<>
						<EditIcon className="edit-icon" onClick={() => showModal(<GeneralModal text="replaceMe"/>)} />
						<RemoveIcon className="remove-icon" onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat komentář?"} actionOnClick={removeComment} submitText={"Smazat"} />)}/>
					</>
				)}
			</div>
			<div className="body html-inner" dangerouslySetInnerHTML={{ __html: formatDescription(body, true) || "" }} />
			<div className="footer">
				<span>Vytvořeno: {new Date(created_at).toLocaleDateString("cs-CZ")}</span>
				<span>Naposledy aktualizováno: {new Date(updated_at).toLocaleDateString("cs-CZ")}</span>
			</div>
		</div>
	);
};

export default Comment;
