import { yupResolver } from "@hookform/resolvers/yup";
import AddAttachment from "components/add-attachment/AddAttachment";
import Button from "components/buttons/Button";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import { useSnackbar } from "contexts/SnackbarProvider";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { useEffect, useState } from "react";
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "redux/reloadSlice";
import { editorLabels } from "static/wysiwyg";
import { Attachment } from "types/offer";
import { commentSchema } from "utils/validationSchemas";
import * as yup from "yup";
import "/src/static/react-draft-wysiwyg.css";
import { useModal } from "../../contexts/ModalProvider";
import axios from "../../utils/axios";
import { removeFooterFromBody } from "utils/plainTextToHtml";

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
	const [commentEditorState, setCommentEditorState] = useState(EditorState.createEmpty());
	const [validate, setValidate] = useState<boolean | null>(null);
	const [commentFocus, setCommentFocus] = useState<boolean>(false);
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const dispatch = useDispatch();

	useEffect(() => {
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

	const formSchema = yup.object().shape({
		body: commentSchema
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

		console.log(JSON.stringify(Object.fromEntries(formData)));
		try {
      await axios.put(`/api/issue/${issueId}/comment/${id}`, formData);
      openSuccessSnackbar("Komentář byl úspěšně změněn!");
      dispatch(setReload("issue"));
      setCommentEditorState(EditorState.createEmpty());
      setFiles([]);
      setValidate(false);
			closeModal();
    } catch (error: any) {
      if (error.response && error.response.status === 500) {
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
			} else {
				openErrorSnackbar(error.response.data.en);
        setError("apiError", {
          type: "server",
          message: error.response.data.en,
        });
			}
      console.error("Error editing comment:", error);
    }
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
