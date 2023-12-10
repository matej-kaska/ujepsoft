import { faFile } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Attachment} from "types/offer";

type AttachmentProps = {
  attachment: Attachment;
};

const Keyword = ({attachment}: AttachmentProps) => {

  return (
    <a href={`${attachment.file}`} target="_blank" rel="noreferrer" className="attachment">
      <FontAwesomeIcon icon={faFile}/>{attachment.name}
    </a>
  )
};

export default Keyword;