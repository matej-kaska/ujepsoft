type LabelProps = {
	label: string;
};

const Label = ({ label }: LabelProps) => {
	const color = label === "bug" ? "red" : label === "enhancement" ? "blue" : label === "question" ? "pink" : "gray";

	const text = label === "bug" ? "chyba" : label === "enhancement" ? "vylepšení" : label === "question" ? "otázka" : "nebude opraveno";

	return (
		<div className={`label ${color}`}>
			<span>{text}</span>
		</div>
	);
};

export default Label;
