type LoadingScreenProps = {
	upper?: boolean;
	modal?: boolean;
	login?: boolean;
};

const LoadingScreen = ({ upper, modal, login }: LoadingScreenProps) => {
	return (
		<section className={`loading-screen ${upper ? "upper" : ""} ${modal ? "modal" : ""} ${login ? "login" : ""}`}>
			<span className="loader" />
		</section>
	);
};

export default LoadingScreen;
