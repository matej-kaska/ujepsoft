import { useEffect, useState } from "react";

export default function useScrollPosition() {
	const [scrollPosition, setPosition] = useState<number>(0);

	useEffect(() => {
		const updatePosition = () => {
			setPosition(window.pageYOffset);
		};

		window.addEventListener("scroll", updatePosition);
		updatePosition();

		return () => window.removeEventListener("scroll", updatePosition);
	}, []);

	return scrollPosition;
}
