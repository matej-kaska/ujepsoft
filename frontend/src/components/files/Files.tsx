import Attachment from "components/attachment/Attachment";
import Arrow from "images/arrow.svg?react";
import { useState } from "react";
import type { Attachment as FileProps } from "types/offer";

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
