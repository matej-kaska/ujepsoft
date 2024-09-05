import AddComment from "components/guides/AddComment";
import Administration from "components/guides/Administration";
import CreateIssueGuide from "components/guides/CreateIssueGuide";
import CreateOfferGuide from "components/guides/CreateOfferGuide";
import EditIssue from "components/guides/EditIssue";
import LookAtIssues from "components/guides/LookAtIssues";
import ScreenshotGuide from "components/guides/ScreenshotGuide";
import ScreenshotGuideMacOS from "components/guides/ScreenshotGuideMacOS";
import Navbar from "components/navbar/Navbar";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "utils/const";

const GuidePage = () => {
	const guides = new Array<JSX.Element>();
	guides.push(<Administration />);
	guides.push(<CreateOfferGuide />);
	guides.push(<CreateIssueGuide />);
	guides.push(<LookAtIssues />);
	guides.push(<EditIssue />)
	guides.push(<AddComment />);
	guides.push(<ScreenshotGuide />);
	guides.push(<ScreenshotGuideMacOS />);

	return (
		<>
			<Helmet>
				<link rel="canonical" href={websiteUrl + "/"} />
			</Helmet>
			<Navbar />
			<section className="guide-page">
				<header>
					<h1>Návody</h1>
					<p>Zde naleznete veškeré potřebné návody. Pokud ovšem narazíte na jakýkoliv problém, neváhejte kontaktovat administrátora na e-mailu pavel.beranek@ujep.cz.</p>
				</header>
				<section className="guides-container">
					{guides.map((guide, index) => (
						<div className={"guide-wrapper"} key={index}>
							{guide}
						</div>
					))}
				</section>
			</section>
		</>
	);
};

export default GuidePage;
