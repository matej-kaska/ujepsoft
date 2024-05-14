import { useSnackbar } from "contexts/SnackbarProvider";
import { Attachment } from "types/issue";
import { ReactComponent as CloseIcon } from "../../images/close.svg";

type AddAttachmentProps = {
	files: File[];
	setFiles: React.Dispatch<React.SetStateAction<File[]>>;
	uploadedFiles?: Attachment[];
	setUploadedFiles?: React.Dispatch<React.SetStateAction<Attachment[]>>;
};

const AddAttachment = ({ files, setFiles, uploadedFiles, setUploadedFiles }: AddAttachmentProps) => {
	const { openErrorSnackbar } = useSnackbar();

	const onFileCloseButtonClick = (index: number) => {
		setFiles((prev: File[]) => {
			return prev.filter((_file: File, fileIndex: number) => fileIndex !== index);
		});
	};

	const onUploadedFileCloseButtonClick = (index: number) => {
		if (!setUploadedFiles) return;
		setUploadedFiles((prev: Attachment[]) => {
			return prev.filter((_file: Attachment, fileIndex: number) => fileIndex !== index);
		});
	};

	const validateSize = (file: File) => {
		if (file.size > 134217728) {
			openErrorSnackbar("Soubor nesmí být větší než 128 MB!");
			return false;
		}
		let totalSize = 0;
		for (const file of files) {
			totalSize += file.size;
		}
		if (totalSize + file.size > 536870912) {
			openErrorSnackbar("Soubory nesmí být větší než 512 MB!");
			return false;
		}
		if (files.length > 49) {
			openErrorSnackbar("Nesmíte nahrát více jak 50 souborů");
			return false;
		}
		return true;
	};

	const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const file = e.target.files[0];
		if (!file) return;
		if (!validateSize(file)) {
			e.target.files = null;
			return;
		}
		setFiles((prev: File[]) => {
			return [...prev, file];
		});
	};

	const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			if (!validateSize(file)) return;
			setFiles((prev: File[]) => [...prev, file]);
		}
	};

	return (
		<>
			<label className="attachments">Přílohy</label>
			<div className="attachment-wrapper">
				<input type="file" className="dropzone" onChange={addFile} id={"dropzone"} />
				<span onClick={() => document.getElementById("dropzone")?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => e.preventDefault()}>
					Sem klikněte nebo přetáhněte soubor...
				</span>
			</div>
			{files.map((file: File, index: number) => {
				return (
					<div className="attachment-added" key={index}>
						<span>{file.name}</span>
						<CloseIcon className="close-icon" onClick={() => onFileCloseButtonClick(index)} />
					</div>
				);
			})}
			{uploadedFiles?.map((file: Attachment, index: number) => {
				return (
					<div className="attachment-added" key={index}>
						<span>{file.name}</span>
						<CloseIcon className="close-icon" onClick={() => onUploadedFileCloseButtonClick(index)} />
					</div>
				);
			})}
		</>
	);
};

export default AddAttachment;
