import { Attachment } from "types/offer";
import FileIcon from "images/file-icon.svg?react";

type AttachmentProps = {
	attachment: Attachment;
};

const Keyword = ({ attachment }: AttachmentProps) => {
	return (
		<a href={`${attachment.file ? attachment.file : attachment.remote_url}`} target="_blank" rel="noreferrer" className="attachment">
			<FileIcon/>
			{attachment.name}
		</a>
	);
};

export default Keyword;
