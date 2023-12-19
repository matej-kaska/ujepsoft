import Navbar from "components/navbar/Navbar";
import ScreenshotGuide from "components/guides/ScreenshotGuide";
import CreateOfferGuide from "components/guides/CreateOfferGuide";
import LookAtIssues from "components/guides/LookAtIssues";
import Administration from "components/guides/Administration";

const GuidePage = () => {
  const guides = new Array<JSX.Element>();
  guides.push(<Administration />);
  guides.push(<CreateOfferGuide />);
  guides.push(<LookAtIssues />);
  guides.push(<ScreenshotGuide />);

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
