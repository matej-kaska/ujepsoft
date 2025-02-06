import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "redux/store";
import UniversalModal from "../components/universal-modal/UniversalModal";
import { closeModal as closeReduxModal } from "../redux/modalSlice";

type ModalContextType = {
	showModal: (content: ReactNode) => void;
	closeModal: () => void;
	modalOpen: boolean;
};
export type ModalProps = {
	closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
	const dispatch = useDispatch();
	const reduxModalState = useSelector((state: RootState) => state.modal);

	const [modalContent, setModalContent] = useState<ReactNode>(null);
	const [modalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		document.body.style.overflow = modalOpen ? "hidden" : "initial";
	}, [modalOpen]);

	useEffect(() => {
		if (reduxModalState.showModal) {
			setModalContent(reduxModalState.component);
			setModalOpen(true);
		} else {
			setModalContent(null);
			setModalOpen(false);
		}
	}, [reduxModalState]);

	const showModal = (content: ReactNode) => {
		setModalContent(content);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalContent(null);
		setModalOpen(false);
		dispatch(closeReduxModal()); // Sync with Redux
	};

	const contextValue: ModalContextType = {
		showModal,
		closeModal,
		modalOpen,
	};

	return (
		<ModalContext.Provider value={contextValue}>
			{children}
			{modalOpen && modalContent && <UniversalModal>{modalContent}</UniversalModal>}
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const currentContext = useContext(ModalContext);

	if (!currentContext) {
		throw new Error("useModal must be used within ModalProvider");
	}

	return currentContext;
};
