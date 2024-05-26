import Button from "components/buttons/Button";
import Keyword from "components/keyword/Keyword";
import Tooltip from "components/tooltip/Tooltip";
import { Link } from "react-router-dom";
import { Offer } from "types/offer";
import { htmlToPlainText } from "utils/htmlToPlainText";
import { ReactComponent as FileIcon } from "images/file-icon.svg";
import { ReactComponent as Chevron } from "images/chevron.svg";

type UnitOfferProps = {
	offer: Offer;
};

const UnitOffer = ({ offer }: UnitOfferProps) => {
	return (
		<section className="unit-offer">
			<h2 className="unit-title">
				<Link to={`/offer/${offer.id}`}>{offer.name}</Link>
			</h2>
			<h3 className="unit-author">{offer.author.email}</h3>
			<section className="unit-keywords">
				{offer.keywords.map((keyword, index) => {
					return <Keyword keyword={keyword} key={index} />;
				})}
			</section>
			<p className="unit-description">{htmlToPlainText(offer.description)}</p>
			<div className="unit-footer">
				{offer.files.length > 0 && (
					<Tooltip text={`Nabídka obsahuje ${offer.files.length} ${offer.files.length === 1 ? "přílohu" : offer.files.length > 4 ? "příloh" : "přílohy"}`}>
						<FileIcon/>
					</Tooltip>
				)}
				<Link to={`/offer/${offer.id}`}>
					<Button icon={<Chevron/>} iconPosition="right">
						Zobrazit
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default UnitOffer;
