import { useSnackbar } from "contexts/SnackbarProvider";
import CloseIcon from "images/close.svg?react";
import type { Attachment } from "types/issue";

type AddAttachmentProps = {
	files: File[];
	setFiles: React.Dispatch<React.SetStateAction<File[]>>;
	uploadedFiles?: Attachment[];
	setUploadedFiles?: React.Dispatch<React.SetStateAction<Attachment[]>>;
	updateDescription?: (deletedFile: Attachment) => void;
};

const AddAttachment = ({ files, setFiles, uploadedFiles, setUploadedFiles, updateDescription }: AddAttachmentProps) => {
	const { openErrorSnackbar } = useSnackbar();

	const onFileCloseButtonClick = (index: number) => {
		setFiles((prev: File[]) => {
			return prev.filter((_file: File, fileIndex: number) => fileIndex !== index);
		});
	};

	const onUploadedFileCloseButtonClick = (index: number) => {
		if (!setUploadedFiles || !uploadedFiles) return;
		const deletedFile = uploadedFiles[index];
		setUploadedFiles((prev: Attachment[]) => {
			return prev.filter((_file: Attachment, fileIndex: number) => fileIndex !== index);
		});
		if (updateDescription) updateDescription(deletedFile);
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
		for (const file of uploadedFiles || []) {
			totalSize += file.size;
		}
		if (totalSize + file.size > 536870912) {
			openErrorSnackbar("Soubory nesmí být větší než 512 MB!");
			return false;
		}
		const totalFiles = files.length + (uploadedFiles?.length || 0);
		if (totalFiles > 49) {
			openErrorSnackbar("Nesmíte nahrát více jak 50 souborů");
			return false;
		}
		return true;
	};

	const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		if (!input.files) return;
		const file = input.files[0];
		if (!file) return;
		if (!validateSize(file)) {
			input.value = "";
			return;
		}
		setFiles((prev: File[]) => {
			return [...prev, file];
		});
		input.value = "";
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
