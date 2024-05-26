import Attachment from "components/attachment/Attachment";
import { useState } from "react";
import { Attachment as FileProps } from "types/offer";
import { ReactComponent as Arrow } from "images/arrow.svg";

type FilesProps = {
	files: FileProps[];
};

const Files = ({ files }: FilesProps) => {
	const [filesOpen, setFilesOpen] = useState<boolean>(false);

	if (!files || files.length === 0) return null;

	return (
		<section className="files-wrapper">
			<div className="show-more" onClick={() => setFilesOpen(!filesOpen)}>
				<span>Zobrazit přílohy ({files.length})</span>
				{filesOpen ? <Arrow className="rotate-180" /> : <Arrow />}
			</div>
			{filesOpen && (
				<div className="files">
					{files.map((file, index) => {
						return <Attachment attachment={file} key={index} />;
					})}
				</div>
			)}
		</section>
	);
};
export default Files;
