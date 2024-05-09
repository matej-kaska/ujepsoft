import draftToHtml from "draftjs-to-html";
import { useEffect, useState } from "react";
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import { useForm } from "react-hook-form";
import { commentSchema } from "utils/validationSchemas";
import * as yup from "yup";
import "/src/static/react-draft-wysiwyg.css";
import { yupResolver } from "@hookform/resolvers/yup";
import { editorLabels } from "static/wysiwyg";
import { useSnackbar } from "contexts/SnackbarProvider";
import axios from "utils/axios";
import { useDispatch, useSelector } from "react-redux";
import Button from "components/buttons/Button";
import AddAttachment from "components/add-attachment/AddAttachment";
import { setReload } from "redux/reloadSlice";

type Form = {
	comment: string;
	apiError?: any;
};

type NewCommentProps = {
  issueId: number;
};

const NewComment = ({issueId}: NewCommentProps) => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [commentEditorState, setCommentEditorState] = useState(EditorState.createEmpty());
  const [commentFocus, setCommentFocus] = useState<boolean>(false);
	const [files, setFiles] = useState<File[]>([]);
  const [validate, setValidate] = useState<boolean>(false);
  const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
  const dispatch = useDispatch();

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

    try {
      await axios.post(`/api/issue/${issueId}/comment/new`, formData);
      openSuccessSnackbar("Komentář byl úspěšně přidán!");
      dispatch(setReload("issue"));
      setCommentEditorState(EditorState.createEmpty());
      setValidate(false);
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
      console.error("Error creating comment:", error);
    }
  };

  return (
    <form className="new-comment" onSubmit={handleSubmit(handlePostComment)}>
      <WysiwygEditor
        stripPastedStyles={true}
        editorState={commentEditorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName={`wrapperClassName ${errors.comment ? "border-red-600" : ""} ${commentFocus ? "focused" : ""}`}
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
          setCommentEditorState(newState);
          if (validate) setValue("comment", text, { shouldValidate: true });
          else setValue("comment", text);
        }}
      />
      <p className={`${errors.comment ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.comment?.message}!</p>
      <AddAttachment files={files} setFiles={setFiles} />
      <Button type="submit">+ Přidat komentář</Button>
    </form>
  );
}

export default NewComment;