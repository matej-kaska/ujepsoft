import { yupResolver } from "@hookform/resolvers/yup";
import AddAttachment from "components/add-attachment/AddAttachment";
import Button from "components/buttons/Button";
import { useSnackbar } from "contexts/SnackbarProvider";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { useEffect, useState } from "react";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "redux/reloadSlice";
import type { RootState } from "redux/store";
import { editorLabels } from "static/wysiwyg";
import axiosRequest from "utils/axios";
import { commentSchema } from "utils/validationSchemas";
import { object } from "yup";
import "/src/static/react-draft-wysiwyg.css";
import LoadingScreen from "components/loading-screen/LoadingScreen";

const WysiwygEditor = React.lazy(() => import("react-draft-wysiwyg").then((module) => ({ default: module.Editor })));

type Form = {
	comment: string;
	apiError?: any;
};

type NewCommentProps = {
	issueId: number;
};

const NewComment = ({ issueId }: NewCommentProps) => {
	const dispatch = useDispatch();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const [commentEditorState, setCommentEditorState] = useState(EditorState.createEmpty());
	const [files, setFiles] = useState<File[]>([]);
	const [commentFocus, setCommentFocus] = useState<boolean>(false);
	const [validate, setValidate] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

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
		comment: commentSchema,
	});

	const {
		setError,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handlePostComment = async (data: Form) => {
		if (!userInfo.id) return;
		setValidate(true);
		const formData = new FormData();
		formData.append("body", data.comment);

		for (const file of files) {
			formData.append("files", file);
		}
		setLoading(true);
		const response = await axiosRequest("POST", `/api/issue/${issueId}/comment/new`, formData);
		if (!response.success) {
			setLoading(false);
			openErrorSnackbar(response.message.cz);
			setError("apiError", {
				type: "server",
				message: response.message.cz,
			});
			console.error("Error creating comment:", response.message.cz);
			return;
		}
		openSuccessSnackbar("Komentář byl úspěšně přidán!");
		dispatch(setReload("issuepage"));
		setCommentEditorState(EditorState.createEmpty());
		setValue("comment", "");
		setFiles([]);
		setValidate(false);
		setLoading(false);
	};

	return (
		<form className="new-comment" onSubmit={handleSubmit(handlePostComment)}>
			{loading ? (
				<LoadingScreen upper />
			) : (
				<>
					<Suspense fallback={<div className="editorClassName">Načítám Editor...</div>}>
						<WysiwygEditor
							stripPastedStyles={true}
							editorState={commentEditorState}
							toolbarClassName="toolbarClassName"
							wrapperClassName={`wrapperClassName ${errors.comment ? "border-red-600" : ""} ${commentFocus ? "focused" : ""}`}
							editorClassName={"editorClassName"}
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
								setCommentEditorState(newState);
								if (validate) setValue("comment", text, { shouldValidate: true });
								else setValue("comment", text);
							}}
						/>
					</Suspense>
					<p className={`${errors.comment ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.comment?.message}!</p>
					<AddAttachment files={files} setFiles={setFiles} />
					<Button type="submit">+ Přidat komentář</Button>
				</>
			)}
		</form>
	);
};

export default NewComment;
