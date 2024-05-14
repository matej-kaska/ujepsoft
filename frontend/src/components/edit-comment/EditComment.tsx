import { yupResolver } from "@hookform/resolvers/yup";
import AddAttachment from "components/add-attachment/AddAttachment";
import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { useEffect, useLayoutEffect, useState } from "react";
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "redux/reloadSlice";
import { RootState } from "redux/store";
import { editorLabels } from "static/wysiwyg";
import { Attachment } from "types/offer";
import axiosRequest from "utils/axios";
import { removeFooterFromBody } from "utils/plainTextToHtml";
import { commentSchema } from "utils/validationSchemas";
import { object } from "yup";
import "/src/static/react-draft-wysiwyg.css";

type Form = {
	body: string;
	apiError?: any;
};

type EditCommentProps = {
	body: string;
	id: number;
	files: Attachment[];
	issueId: number;
};

const EditComment = ({ body, id, issueId, files: existingFiles }: EditCommentProps) => {
	const dispatch = useDispatch();
	const { closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const [commentEditorState, setCommentEditorState] = useState(EditorState.createEmpty());
	const [files, setFiles] = useState<File[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
	const [validate, setValidate] = useState<boolean | null>(null);
	const [commentFocus, setCommentFocus] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (!issueId) return;
		const stripedBody = removeFooterFromBody(body);
		const editorState = EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(stripedBody || "<p></p>").contentBlocks));
		setCommentEditorState(editorState);
		setUploadedFiles(existingFiles);
		const text = draftToHtml(convertToRaw(editorState.getCurrentContent()));
		setValue("body", text);
	}, []);

	useEffect(() => {
		const editorElement = document.querySelector(".public-DraftEditor-content");

		if (editorElement) {
			editorElement.addEventListener("focus", () => setCommentFocus(true), true);
			editorElement.addEventListener("blur", () => setCommentFocus(false), true);
		}

		return () => {
			if (editorElement) {
				editorElement.removeEventListener("focus", () => setCommentFocus(true), true);
				editorElement.removeEventListener("blur", () => setCommentFocus(false), true);
			}
		};
	}, []);

	const formSchema = object().shape({
		body: commentSchema,
	});

	const {
		setError,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handlePostIssue = async (data: Form) => {
		if (!userInfo.id) return;
		setValidate(true);
		const formData = new FormData();
		formData.append("body", data.body);

		for (const file of files) {
			formData.append("files", file);
		}

		let newUploadedFiles: string[] = [];

		for (const uploadedFile of uploadedFiles) {
			newUploadedFiles = [...newUploadedFiles, uploadedFile.name];
		}

		formData.append("existingFiles", JSON.stringify(newUploadedFiles));
		setLoading(true);

		const response = await axiosRequest("PUT", `/api/issue/${issueId}/comment/${id}`, formData);
		if (!response.success) {
			setLoading(false);
			openErrorSnackbar(response.message.cz);
			setError("apiError", { type: "server", message: response.message.cz });
			console.error("Error editing comment:", response.message.cz);
			return;
		}
		setLoading(false);
		openSuccessSnackbar("Komentář byl úspěšně změněn!");
		dispatch(setReload("issuepage"));
		setCommentEditorState(EditorState.createEmpty());
		setFiles([]);
		setValidate(false);
		closeModal();
	};

	return (
		<>
			{loading ? (
				<LoadingScreen modal />
			) : (
				<form className="edit-comment" onSubmit={handleSubmit(handlePostIssue)}>
					<h1>Změnit komentář</h1>
					<WysiwygEditor
						stripPastedStyles={true}
						editorState={commentEditorState}
						toolbarClassName="toolbarClassName"
						wrapperClassName={`wrapperClassName ${errors.body ? "border-red-600" : ""} ${commentFocus ? "focused" : ""}`}
						editorClassName={"editorClassName"}
						editorStyle={{ fontFamily: "Plus Jakarta Sans" }}
						toolbar={{
							options: ["inline", "blockType", "list", "emoji", "remove", "history"],
							inline: { options: ["bold", "italic", "underline", "strikethrough"] },
						}}
						localization={{ locale: "en", translations: editorLabels }}
						onEditorStateChange={(newState: any) => {
							let hasAtomicValue = false;
							for (const element of newState.getCurrentContent().blockMap) {
								if (element.type === "atomic") hasAtomicValue = true;
							}
							if (hasAtomicValue) {
								alert("Používáte nepodporované znaky. Zkopírujte text do poznámkového bloku a obsah znovu zkopírujte a vložte!");
								return;
							}
							const text = draftToHtml(convertToRaw(newState.getCurrentContent()));
							if (text.length > 8191) return alert("Komentář nesmí být delší než 8191 raw znaků!");
							setCommentFocus(newState);
							if (validate) setValue("body", text, { shouldValidate: true });
							else setValue("body", text);
							setCommentEditorState(newState);
						}}
					/>
					<p className={`${errors.body ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.body?.message}!</p>
					<AddAttachment files={files} setFiles={setFiles} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
					{errors.apiError && <p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>}
					<div className="buttons">
						<Button type="submit" onClick={() => setValidate(true)}>
							Změnit komentář
						</Button>
					</div>
				</form>
			)}
		</>
	);
};

export default EditComment;
