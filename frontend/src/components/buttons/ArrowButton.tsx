import { Link } from "react-router-dom";
import { ReactComponent as ArrowIcon } from "../../images/arrow-icon.svg";

type ArrowButtonProps = {
	id: number;
};

const ArrowButton = ({ id }: ArrowButtonProps) => {
	return (
		<div className="arrow-button p-purple-bg-h">
			<Link to={`/teaching-unit/${id}`}>
				<ArrowIcon />
			</Link>
		</div>
	);
};

export default ArrowButton;
