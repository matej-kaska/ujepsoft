import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/buttons/Button";
import Label from "components/label/Label";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { Link } from "react-router-dom";
import { Issue } from "types/issue";
import { htmlToPlainText } from "utils/htmlToPlainText";
import { removeFooterFromBody } from "utils/plainTextToHtml";

type UnitIssueProps = {
	issue: Issue;
};

const UnitIssue = ({ issue }: UnitIssueProps) => {
	return (
		<section className="unit-issue">
			<h2 className="unit-title">
				<Link to={`/issue/${issue.id}`}>{issue.title}</Link>
				{issue.state === "closed" && <span className="closed">(uzavřené)</span>}
			</h2>
			<h3>{issue.repo.name}</h3>
			<ProfileBadge name={issue.author} profilePicture={issue.author_profile_pic} authorUjepsoft={issue.author_ujepsoft} />
			{issue.labels.length > 0 && (
				<section className="unit-labels">
					{issue.labels.map((label, index) => {
						return <Label label={label} key={index} />;
					})}
				</section>
			)}
			<p className="unit-description">{issue.body && htmlToPlainText(removeFooterFromBody(issue.body))}</p>
			<div className="unit-footer">
				<span className="unit-comments">Počet komentářů: {issue.comments}</span>
				<span className="unit-date">Vytvořeno: {new Date(issue.created_at).toLocaleDateString("cs-CZ")}</span>
				<span className="unit-date ml-4">Naposledy aktualizováno: {new Date(issue.updated_at).toLocaleDateString("cs-CZ")}</span>
				<Link to={`/issue/${issue.id}`}>
					<Button icon={<FontAwesomeIcon icon={faChevronRight} />} iconPosition="right">
						Zobrazit
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default UnitIssue;
