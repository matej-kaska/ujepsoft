import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { yupResolver } from "@hookform/resolvers/yup";
import AddAttachment from "components/add-attachment/AddAttachment";
import Button from "components/buttons/Button";
import Dropdown from "components/dropdown/Dropdown";
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
import { editorLabels } from "static/wysiwyg";
import { FullIssue } from "types/issue";
import { Attachment } from "types/offer";
import { RepoSelect } from "types/repo";
import { timeout } from "utils/timeout";
import { descriptionSchema, labelsSchema, offerNameSchema, repoSelectSchema } from "utils/validationSchemas";
import * as yup from "yup";
import "/src/static/react-draft-wysiwyg.css";
import { useModal } from "../../contexts/ModalProvider";
import axios from "../../utils/axios";

type Form = {
	name: string;
	repo: number;
	labels: string[];
	description: string;
	apiError?: any;
};

type NewIssueProps = {
	issue?: FullIssue;
};

const NewIssue = ({ issue }: NewIssueProps) => {
	const [repos, setRepos] = useState<RepoSelect[]>([]);
	const [selectValue, setSelectValue] = useState<number>(0);
	const [descriptionEditorState, setDescriptionEditorState] = useState(EditorState.createEmpty());
	const [validate, setValidate] = useState<boolean | null>(null);
	const [focusDescription, setFocusDescription] = useState<boolean>(false);
	const [hoverSelect, setHoverSelect] = useState<boolean>(false);
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const [labels, setLabels] = useState<string[]>([]);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		getRepos();
		if (!issue) return;
		setValue("name", issue.title);
		setValue("labels", issue.labels);
		setLabels(issue.labels);
		setValue("repo", issue.repo.id);
		setSelectValue(issue.repo.id);
		const editorState = EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(issue.body || "<p></p>").contentBlocks));
		setDescriptionEditorState(editorState);
		setUploadedFiles(issue.files);
		const text = draftToHtml(convertToRaw(editorState.getCurrentContent()));
		setValue("description", text);
	}, []);

	useEffect(() => {
		if (selectValue === 0) return;
		if (validate) setValue("repo", selectValue, { shouldValidate: true });
		else setValue("repo", selectValue);
	}, [selectValue]);

	useEffect(() => {
		const editorElement = document.querySelector(".public-DraftEditor-content");
		const selectElement = document.querySelector(".select");

		if (editorElement) {
			editorElement.addEventListener("focus", () => setFocusDescription(true), true);
			editorElement.addEventListener("blur", () => setFocusDescription(false), true);
		}
		if (selectElement) {
			selectElement.addEventListener("click", () => optionsHoverHandle(), true);
		}

		return () => {
			if (editorElement) {
				editorElement.removeEventListener("focus", () => setFocusDescription(true), true);
				editorElement.removeEventListener("blur", () => setFocusDescription(false), true);
			}
			if (selectElement) {
				selectElement.removeEventListener("click", () => optionsHoverHandle(), true);
			}
		};
	}, []);

	const optionsHoverHandle = async () => {
		await timeout(50);
		const optionsElement = document.querySelector(".options");

		if (optionsElement) {
			optionsElement.addEventListener("mouseenter", () => setHoverSelect(true), true);
			optionsElement.addEventListener("mouseleave", () => setHoverSelect(false), true);
			optionsElement.addEventListener("click", () => setHoverSelect(false), true);
		} else {
			setHoverSelect(false);
		}

		return () => {
			if (optionsElement) {
				optionsElement.removeEventListener("mouseenter", () => setHoverSelect(true), true);
				optionsElement.removeEventListener("mouseleave", () => setHoverSelect(false), true);
				optionsElement.removeEventListener("click", () => setHoverSelect(false), true);
			}
			setHoverSelect(false);
		};
	};

	const formSchema = yup.object().shape({
		name: offerNameSchema,
		repo: repoSelectSchema,
		labels: labelsSchema,
		description: descriptionSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<Form>({
		resolver: yupResolver(formSchema),
	});

	const getRepos = async () => {
		try {
			const response = await axios.get("/api/repo/list/small");
			if (response.data) setRepos(response.data);
		} catch (error) {
			console.error("Error getting repos:", error);
		}
	};

	const changeLabel = (label: string) => {
		let labels = getValues("labels");
		if (!labels) labels = [];
		if (validate) {
			if (labels?.includes(label)) {
				setValue(
					"labels",
					labels.filter((l: string) => l !== label),
					{ shouldValidate: true },
				);
				setLabels((prev: string[]) => prev.filter((l: string) => l !== label));
			} else {
				setValue("labels", [...labels, label], { shouldValidate: true });
				setLabels([...labels, label]);
			}
		} else {
			if (labels?.includes(label)) {
				setValue(
					"labels",
					labels.filter((l: string) => l !== label),
				);
				setLabels((prev: string[]) => prev.filter((l: string) => l !== label));
			} else {
				setValue("labels", [...labels, label]);
				setLabels([...labels, label]);
			}
		}
	};

	const handlePostIssue = async (data: Form) => {
		if (!userInfo.id) return;
		if (data.name.trim() === "") {
			alert("Název pohledávky nesmí být prázdný!");
			return;
		}
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("repo", data.repo.toString());
		formData.append("labels", JSON.stringify(data.labels));
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

		console.log(JSON.stringify(Object.fromEntries(formData)));
		if (issue) {
			try {
				await axios.put(`/api/issue/${issue.id}`, formData);
				setLoading(false);
				openSuccessSnackbar("Pohledávka byla úspěšně upravena!");
				closeModal();
				dispatch(setReload("issuepage"));
			} catch (error) {
				setLoading(false);
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				setError("apiError", {
					type: "server",
					message: "Někde nastala chyba zkuste to znovu",
				});
				console.error("Error editing issue:", error);
			}
		} else {
			try {
				const response = await axios.post("/api/issue", formData);
				setLoading(false);
				openSuccessSnackbar("Pohledávka byla úspěšně vytvořena!");
				closeModal();
				dispatch(setReload("issue"));
				navigate(`/issue/${response.data.id}`);
			} catch (error) {
				openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
				setLoading(false);
				setError("apiError", {
					type: "server",
					message: "Někde nastala chyba zkuste to znovu",
				});
				console.error("Error posting issue:", error);
			}
		}
	};

	return (
		<>
			{loading ? (
				<LoadingScreen modal />
			) : (
				<form className="new-issue" onSubmit={handleSubmit(handlePostIssue)}>
					<h1>{issue ? "Změnit pohledávku (issue)" : "Vytvořit pohledávku (issue)"}</h1>
					<label className="name">Název</label>
					<input className={`${errors.name ? "border-red-600" : ""}`} placeholder="Zadejte název pohledávky..." {...register("name")} maxLength={100} />
					<p className={`${errors.name ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.name?.message}!</p>
					<label className="repo">Aplikace</label>
					<Dropdown
						label={selectValue !== 0 ? (repos.find((repo: RepoSelect) => repo.id === selectValue) || { name: "Vyberte aplikaci..." }).name : "Vyberte aplikaci..."}
						className={`select ${errors.repo ? "border-red-600" : ""} ${selectValue !== 0 ? "" : "unselected"} ${hoverSelect ? "darken" : ""}`}
						defaultClasses={false}
						menuClasses="options"
						noArrow={true}
						disabled={issue ? true : false}
					>
						{repos.map((repo: RepoSelect, index: number) => {
							return (
								<Dropdown.Item key={index} onClick={() => setSelectValue(repo.id)}>
									{repo.name}
								</Dropdown.Item>
							);
						})}
					</Dropdown>
					<FontAwesomeIcon icon={faChevronDown} className={`arrow ${issue ? "arrow-disabled" : ""}`} />
					<p className={`${errors.repo ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.repo?.message}!</p>
					<div className="labels-wrapper">
						<h2>Označení </h2>
						<div className="labels">
							<div className="label">
								<input type="checkbox" id="bug" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("bug")} checked={labels.includes("bug")} />
								<FontAwesomeIcon icon={faCheck} className="check" />
								<label htmlFor="bug" className="bug">
									chyba
								</label>
							</div>
							<div className="label">
								<input type="checkbox" id="enhancement" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("enhancement")} checked={labels.includes("enhancement")} />
								<FontAwesomeIcon icon={faCheck} className="check" />
								<label htmlFor="enhancement" className="enhancement">
									vylepšení
								</label>
							</div>
							<div className="label">
								<input type="checkbox" id="question" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("question")} checked={labels.includes("question")} />
								<FontAwesomeIcon icon={faCheck} className="check" />
								<label htmlFor="question" className="question">
									otázka
								</label>
							</div>
						</div>
					</div>
					<p className={`${errors.labels ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.labels?.message || errors.labels?.[0]?.message}!</p>
					<label className="description" htmlFor="description">
						Popis poptávky
					</label>
					<WysiwygEditor
						stripPastedStyles={true}
						editorState={descriptionEditorState}
						toolbarClassName="toolbarClassName"
						wrapperClassName={`wrapperClassName ${errors.description ? "border-red-600" : ""} ${focusDescription ? "focused" : ""}`}
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
							{issue ? "Změnit pohledávku" : "Vytvořit pohledávku"}
						</Button>
					</div>
				</form>
			)}
		</>
	);
};

export default NewIssue;
