import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Attachment from "components/attachment/Attachment";
import { useState } from "react";
import { Attachment as FileProps } from "types/offer";

const Files = ({ files }: { files: FileProps[] }) => {
	const [filesOpen, setFilesOpen] = useState<boolean>(false);

	return (
		<>
			{files.length > 0 && (
				<section className="files-wrapper">
					<div className="show-more" onClick={() => setFilesOpen(!filesOpen)}>
						<span>Zobrazit přílohy ({files.length})</span>
						{filesOpen ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
					</div>
					{filesOpen && (
						<div className="files">
							{files.map((file, index) => {
								return <Attachment attachment={file} key={index} />;
							})}
						</div>
					)}
				</section>
			)}
		</>
	);
};
export default Files;
