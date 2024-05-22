import Administration from "components/guides/Administration";
import CreateOfferGuide from "components/guides/CreateOfferGuide";
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
	guides.push(<ScreenshotGuide />);
	guides.push(<ScreenshotGuideMacOS />);

	return (
		<>
			<Navbar />
			<section className="guide-page">
				<header>
					<h1>Návody</h1>
					<p>Zde naleznete návody... (doplnit)</p>
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
