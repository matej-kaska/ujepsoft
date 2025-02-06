import Button from "components/buttons/Button";
import Keyword from "components/keyword/Keyword";
import Chevron from "images/chevron.svg?react";
import FileIcon from "images/file-icon.svg?react";
import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import type { Offer } from "types/offer";
import { htmlToPlainText } from "utils/htmlToPlainText";

const Tooltip = React.lazy(() => import("components/tooltip/Tooltip"));

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
					<Suspense
						fallback={
							<div className="loading-tooltip">
								<FileIcon />
							</div>
						}
					>
						<Tooltip text={`Nabídka obsahuje ${offer.files.length} ${offer.files.length === 1 ? "přílohu" : offer.files.length > 4 ? "příloh" : "přílohy"}`}>
							<FileIcon />
						</Tooltip>
					</Suspense>
				)}
				<Link to={`/offer/${offer.id}`}>
					<Button icon={<Chevron />} iconPosition="right">
						Zobrazit
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default UnitOffer;
