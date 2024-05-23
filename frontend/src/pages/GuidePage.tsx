import AddComment from "components/guides/AddComment";
import Administration from "components/guides/Administration";
import CreateOfferGuide from "components/guides/CreateOfferGuide";
import DetailedIssue from "components/guides/EditIssue";
import EditIssue from "components/guides/EditIssue";
import LookAtIssues from "components/guides/LookAtIssues";
import ScreenshotGuide from "components/guides/ScreenshotGuide";
import ScreenshotGuideMacOS from "components/guides/ScreenshotGuideMacOS";
import Navbar from "components/navbar/Navbar";

// TODO: CONVERT ALL IMAGES TO WEBP
const GuidePage = () => {
	const guides = new Array<JSX.Element>();
	guides.push(<Administration />);
	guides.push(<CreateOfferGuide />);
	guides.push(<LookAtIssues />);
	guides.push(<DetailedIssue />);
	guides.push(<AddComment />);
	guides.push(<ScreenshotGuide />);
	guides.push(<ScreenshotGuideMacOS />);

	return (
		<>
			<Navbar />
			<section className="guide-page">
				<header>
					<h1>Návody</h1>
					<p>Zde naleznete návody veškeré potřebné návody. Pokud ovšem narazíte na jakýkoliv problém, neváhejte nás kontaktovat na CUS@PIC.</p>
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
