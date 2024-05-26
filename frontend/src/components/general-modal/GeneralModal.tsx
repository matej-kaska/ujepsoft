import { useState } from "react";
import { useModal } from "../../contexts/ModalProvider";
import Button from "../buttons/Button";
import { ReactComponent as CloseIcon } from "images/close.svg";

export interface GeneralModalProps {
	text: string;
	actionOnClick?: (() => void) | undefined;
	input?: string;
	actionOnClickWparam?: (inputValue: string) => void;
	submitText?: string;
}

const GeneralModal = ({ text, actionOnClick, input, actionOnClickWparam, submitText }: GeneralModalProps) => {
	const { closeModal } = useModal();
	const [inputValue, setInputValue] = useState<string>("");

	return (
		<div className="general-modal">
			<header className="modal-header">
				<h1>{text}</h1>
				<CloseIcon className="close-icon" onClick={() => closeModal()} />
			</header>
			{input && (
				<>
					<h2>{input}</h2>
					<input type="password" className="input" onChange={(e) => setInputValue(e.target.value)} />
				</>
			)}
			<div className="buttons">
				<Button color="secondary" className="close-button" onClick={closeModal}>
					Zrušit
				</Button>
				{actionOnClickWparam ? (
					<Button color="accent" className="remove-button" onClick={() => actionOnClickWparam(inputValue)}>
						Smazat
					</Button>
				) : (
					<Button color="accent" className="remove-button" onClick={actionOnClick}>
						{submitText ? submitText : "Smazat"}
					</Button>
				)}
			</div>
		</div>
	);
};

export default GeneralModal;
