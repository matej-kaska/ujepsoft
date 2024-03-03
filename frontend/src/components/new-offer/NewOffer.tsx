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
import { useNavigate } from "react-router-dom";
import { setReload } from "redux/reloadSlice";
import { Attachment, Offer } from "types/offer";
import { descriptionSchema, offerKeywordsSchema, offerNameSchema } from "utils/validationSchemas";
import * as yup from "yup";
import "/src/static/react-draft-wysiwyg.css";
import { useModal } from "../../contexts/ModalProvider";
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import axios from "../../utils/axios";

type Form = {
	name: string;
	keywords: string[];
	description: string;
	apiError?: any;
};

type NewOfferProps = {
	offer?: Offer;
};

const NewOffer = ({ offer }: NewOfferProps) => {
	const [keywords, setKeywords] = useState<string[]>([]);
	const [keywordsInputValue, setKeywordsInputValue] = useState<string>("");
	const [descriptionEditorState, setDescriptionEditorState] = useState(EditorState.createEmpty());
	const [validate, setValidate] = useState<boolean>(false);
	const [focusDescription, setFocusDescription] = useState<boolean>(false);
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { closeModal } = useModal();
	const { openSnackbar, openErrorSnackbar } = useSnackbar();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		if (!offer) return;
		setValue("name", offer.name);
		setKeywords(offer.keywords);
		const editorState = EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(offer.description || "<p></p>").contentBlocks));
		setDescriptionEditorState(editorState);
		setUploadedFiles(offer.files);
		const text = draftToHtml(convertToRaw(editorState.getCurrentContent()));
		setValue("description", text);
	}, []);

	useEffect(() => {
		if (validate) setValue("keywords", keywords, { shouldValidate: true });
		else setValue("keywords", keywords);
	}, [keywords]);

	useEffect(() => {
		const editorElement = document.querySelector(".public-DraftEditor-content");

		if (editorElement) {
			editorElement.addEventListener("focus", () => setFocusDescription(true), true);
			editorElement.addEventListener("blur", () => setFocusDescription(false), true);
		}

		return () => {
			if (editorElement) {
				editorElement.removeEventListener("focus", () => setFocusDescription(true), true);
				editorElement.removeEventListener("blur", () => setFocusDescription(false), true);
			}
		};
	}, []);

	const formSchema = yup.object().shape({
		name: offerNameSchema,
		keywords: offerKeywordsSchema,
		description: descriptionSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && keywordsInputValue === "") {
			if (keywords.length > 0) {
				setKeywords((prev: string[]) => {
					return prev.slice(0, prev.length - 1);
				});
			}
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (keywordsInputValue.trim() !== "") {
				if (keywords.length > 19 || keywords.includes(keywordsInputValue.trim())) return;
				setKeywords((prev: string[]) => {
					return [...prev, keywordsInputValue.trim()];
				});
				setKeywordsInputValue("");
			}
		}
	};

	const onKeywordCloseButtonClick = (keyword: string) => {
		setKeywords((prev: string[]) => {
			return prev.filter((prevKeyword: string) => prevKeyword !== keyword);
		});
	};

	const handlePostOffer = async (data: Form) => {
		if (!userInfo.id) return;
		if (data.name.trim() === "") {
			alert("Název nabídky nesmí být prázdný!");
			return;
		}

		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("keywords", JSON.stringify(data.keywords));
		formData.append("description", data.description);

		for (const file of files) {
			formData.append("files", file);
		}

		let newUploadedFiles: string[] = [];

		for (const uploadedFile of uploadedFiles) {
			newUploadedFiles = [...newUploadedFiles, uploadedFile.name];
		}

		formData.append("existingFiles", JSON.stringify(newUploadedFiles));
		setLoading(true);
		if (offer) {
			try {
				await axios.put(`/api/offer/${offer.id}`, formData);
				setLoading(false);
				openSnackbar("Nabídka byla úspěšně upravena!");
				closeModal();
				dispatch(setReload("offerpage"));
			} catch (error) {
				setLoading(false);
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				setError("apiError", {
					type: "server",
					message: "Někde nastala chyba zkuste to znovu",
				});
				console.error("Error editing offer:", error);
			}
		} else {
			try {
				const response = await axios.post("/api/offer", formData);
				setLoading(false);
				openSnackbar("Nabídka byla úspěšně vytvořena!");
				closeModal();
				dispatch(setReload("offer"));
				navigate(`/offer/${response.data.id}`);
			} catch (error) {
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				setLoading(false);
				setError("apiError", {
					type: "server",
					message: "Někde nastala chyba zkuste to znovu",
				});
				console.error("Error posting offer:", error);
			}
		}
	};

	return (
		<>
			{loading ? (
				<LoadingScreen modal />
			) : (
				<form className="new-offer" onSubmit={handleSubmit(handlePostOffer)}>
					<h1>{offer ? "Změnit nabídku" : "Vytvořit nabídku"}</h1>
					<label className="name">Název</label>
					<input className={`${errors.name ? "border-red-600" : ""}`} placeholder="Zadejte název nabídky..." {...register("name")} maxLength={100} />
					<p className={`${errors.name ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.name?.message}!</p>
					<div className="keywords-wrapper">
						<div className="keywords-container">
							<label htmlFor="keywords-input">Klíčová slova: </label>
							<div className="keywords">
								{keywords.length ? null : <span className="add-keyword">Pro přidání klíčového slova stikněte Enter...</span>}
								{keywords.map((keyword, index) => (
									<div key={index} className="keyword-tag">
										<div className="keyword-name">{keyword}</div>
										<CloseIcon className="close-icon" onClick={() => onKeywordCloseButtonClick(keyword)} />
									</div>
								))}
							</div>
						</div>
						<input type="text" className={`${errors.keywords ? "border-red-600" : ""} keywords-input`} id="keywords-input" placeholder="Zadejte klíčové slovo..." maxLength={63} value={keywordsInputValue} onChange={(e) => setKeywordsInputValue(e.target.value)} onKeyDown={handleKeyDown} />
					</div>
					<p className={`${errors.keywords ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.keywords?.message || errors.keywords?.[0]?.message}!</p>
					<label className="description" htmlFor="description">
						Popis nabídky
					</label>
					<WysiwygEditor
						stripPastedStyles={true}
						editorState={descriptionEditorState}
						toolbarClassName="toolbarClassName"
						wrapperClassName={`wrapperClassName ${errors.description ? "border-red-600" : ""} ${focusDescription ? "focused" : ""}`}
						editorClassName={"editorClassName"}
						editorStyle={{ fontFamily: "Plus Jakarta Sans" }}
						toolbar={{
							options: ["inline", "fontSize", "list", "emoji", "remove", "history"],
							inline: { options: ["bold", "italic", "underline", "strikethrough"] },
						}}
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
							if (text.length > 8191) return alert("Popis nabídky nesmí být delší než 8191 raw znaků!");
							setDescriptionEditorState(newState);
							if (validate) setValue("description", text, { shouldValidate: true });
							else setValue("description", text);
						}}
					/>
					<p className={`${errors.description ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.description?.message}!</p>
					<AddAttachment files={files} setFiles={setFiles} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
					{errors.apiError && <p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>}
					<div className="buttons">
						<Button type="submit" onClick={() => setValidate(true)}>
							{offer ? "Změnit nabídku" : "Vytvořit nabídku"}
						</Button>
					</div>
				</form>
			)}
		</>
	);
};

export default NewOffer;
