import { useState } from "react";
import { useModal } from "../../contexts/ModalProvider";
import Button from "../buttons/Button";

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
			<h1>{text}</h1>
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
					<Button color="primary" className="remove-button" onClick={() => actionOnClickWparam(inputValue)}>
						Smazat
					</Button>
				) : (
					<Button color="primary" className="remove-button" onClick={actionOnClick}>
						{submitText ? submitText : "Smazat"}
					</Button>
				)}
			</div>
		</div>
	);
};

export default GeneralModal;
