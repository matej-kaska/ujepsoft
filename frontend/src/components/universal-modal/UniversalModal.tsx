import { ReactNode, useEffect, useRef, useState } from "react";
import { useModal } from "../../contexts/ModalProvider";
import useWindowSize from "../../utils/useWindowSize";

type UniversalModalProps = {
	children: ReactNode;
};

const UniversalModal = ({ children }: UniversalModalProps) => {
	const { closeModal } = useModal();
	const windowSize = useWindowSize();
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number>(0);

	const handleOutsideContentClick = () => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === "INPUT") return;
		if (activeElement && activeElement.tagName === "TEXTAREA") return;
		if (activeElement?.className.includes("DraftEditor")) return;

		closeModal();
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeModal();
		};

		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [closeModal]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setHeight(entry.contentRect.height);
			}
		});

		if (ref.current) {
			resizeObserver.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				resizeObserver.unobserve(ref.current);
			}
		};
	}, []);

	return (
		<aside className={`universal-modal scrollbar ${height >= windowSize?.[1] ? "modal-height-overflow" : ""}`} onClick={handleOutsideContentClick}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()} ref={ref}>
				{children}
			</div>
		</aside>
	);
};
export default UniversalModal;
