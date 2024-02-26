import ProfileBadge from "components/profile-badge/ProfileBadge";
import { Comment as CommentProps } from "types/issue";
import { formatDescription } from "utils/plainTextToHtml";

const Comment = ({ author, author_profile_pic, author_ujepsoft, body, created_at, updated_at, id, number }: CommentProps) => {
	return (
		<div className="comment">
			<ProfileBadge name={author} profilePicture={author_profile_pic} authorUjepsoft={author_ujepsoft} />
			<div className="body html-inner" dangerouslySetInnerHTML={{ __html: formatDescription(body) || "<p></p>" }} />
			<div className="footer">
				<span>Vytvořeno: {new Date(created_at).toLocaleDateString("cs-CZ")}</span>
				<span>Naposledy aktualizováno: {new Date(updated_at).toLocaleDateString("cs-CZ")}</span>
			</div>
		</div>
	);
};

export default Comment;
