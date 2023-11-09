import "./LoadingScreen.scss"

type LoadingScreenProps = {
  upper?: boolean;
  modal?: boolean;
}

const LoadingScreen = ({upper, modal}: LoadingScreenProps) => {
  return (
    <section className={`loading-screen ${upper ? "upper" : ""} ${modal ? "modal" : ""}`}>
      <span className="loader"/>
    </section>
  );
};

export default LoadingScreen;