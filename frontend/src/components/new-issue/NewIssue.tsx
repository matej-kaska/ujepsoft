import { useModal } from '../../contexts/ModalProvider';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "../../utils/axios";
import Button from 'components/buttons/Button';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { labelsSchema, offerNameSchema, descriptionSchema, repoSelectSchema } from 'utils/validationSchemas';
import { useEffect, useState } from 'react';
import { ReactComponent as CloseIcon } from '../../images/close.svg';
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import "/src/static/react-draft-wysiwyg.css";
import { editorLabels } from 'static/wysiwyg';
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from 'redux/reloadSlice';
import { Attachment, Offer } from 'types/offer';
import htmlToDraft from 'html-to-draftjs';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from 'components/loading-screen/LoadingScreen';
import { RepoSelect } from 'types/repo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'components/dropdown/Dropdown';
import { timeout } from 'utils/timeout';

type Form = {
  name: string;
  repo: number;
  labels: string[];
  description: string;
  apiError?: any;
}

type NewIssueProps = {
  issue?: Offer;
}

const NewIssue = ({issue}: NewIssueProps) => {
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
  const { openSnackbar, openErrorSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getRepos();
    if (!issue) return;
    setValue('name', issue.name);
    // TODO: set labels
    const editorState = EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft((issue.description) || '<p></p>').contentBlocks));
    setDescriptionEditorState(editorState);
    setUploadedFiles(issue.files);
    const text = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setValue("description", text);
  }, [])

  useEffect(() => {
    if (selectValue === 0) return;
    if (validate) setValue("repo", selectValue, { shouldValidate: true })
    else setValue("repo", selectValue);
  }, [selectValue])

  useEffect(() => {
    const editorElement = document.querySelector('.public-DraftEditor-content');
    const selectElement = document.querySelector('.select');

    if (editorElement) {
      editorElement.addEventListener('focus', () => setFocusDescription(true), true);
      editorElement.addEventListener('blur', () => setFocusDescription(false), true);
    }
    if (selectElement) {
      selectElement.addEventListener('click', () => optionsHoverHandle(), true);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('focus', () => setFocusDescription(true), true);
        editorElement.removeEventListener('blur', () => setFocusDescription(false), true);
      }
      if (selectElement) {
        selectElement.removeEventListener('click', () => optionsHoverHandle(), true);
      }
    };
  }, []);

  const optionsHoverHandle = async () => {
    await timeout(50);
    const optionsElement = document.querySelector('.options');

    if (optionsElement) {
      optionsElement.addEventListener('mouseenter', () => setHoverSelect(true), true);
      optionsElement.addEventListener('mouseleave', () => setHoverSelect(false), true);
      optionsElement.addEventListener('click', () => setHoverSelect(false), true);
    } else {
      setHoverSelect(false);
    }

    return () => {
      if (optionsElement) {
        optionsElement.removeEventListener('mouseenter', () => setHoverSelect(true), true);
        optionsElement.removeEventListener('mouseleave', () => setHoverSelect(false), true);
        optionsElement.removeEventListener('click', () => setHoverSelect(false), true);
      }
      setHoverSelect(false);
    };
  }

  const formSchema = yup.object().shape({
    name: offerNameSchema,
    repo: repoSelectSchema,
    labels: labelsSchema,
    description: descriptionSchema
  });

  const {setError, register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<Form>({ 
    resolver: yupResolver(formSchema)
  });

  const getRepos = async () => {
    try {
      const response = await axios.get('/api/repo/list/small');
      if (response.data) setRepos(response.data);
    } catch (error) {
      console.error('Error getting repos:', error);
    }
  }

  const changeLabel = (label: string) => {
    let labels = getValues("labels");
    if (!labels) labels = [];
    if (validate) {
      if (labels && labels.includes(label)) setValue("labels", labels.filter((l: string) => l !== label), { shouldValidate: true })
      else setValue("labels", [...labels, label], { shouldValidate: true })
    } else {
      if (labels &&  labels.includes(label)) setValue("labels", labels.filter((l: string) => l !== label))
      else setValue("labels", [...labels, label])
    }
  }

  const onFileCloseButtonClick = (index: number) => {
    setFiles((prev: File[]) => {
      return prev.filter((_file: File, fileIndex: number) => fileIndex !== index)
    });
  }

  const onUploadedFileCloseButtonClick = (index: number) => {
    setUploadedFiles((prev: Attachment[]) => {
      return prev.filter((_file: Attachment, fileIndex: number) => fileIndex !== index)
    });
  }

  const validateSize = (file: File) => {
    if (file.size > 134217728) {openErrorSnackbar("Soubor nesmí být větší než 128 MB!"); return false;}
    let totalSize: number = 0;
    files.forEach((file: File) => {
      totalSize += file.size;
    })
    if (totalSize + file.size > 536870912) {openErrorSnackbar("Soubory nesmí být větší než 512 MB!"); return false;}
    if (files.length > 49) {openErrorSnackbar("Nesmíte nahrát více jak 50 souborů"); return false;}
    return true;
  }

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
    if (!validateSize(file)) {e.target.files = null; return;}
    setFiles((prev: File[]) => {
      return [...prev, file]
    });
  }

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!validateSize(file)) return;
      setFiles((prev: File[]) => [...prev, file]);
    }
  };

  const handlePostIssue = async (data: Form) => {
    if (!userInfo.id) return;
    if (data.name.trim() === "") {
      alert("Název pohledávky nesmí být prázdný!");
      return;
    }
    console.log(data.description)
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('repo', data.repo.toString());
    formData.append('labels', JSON.stringify(data.labels));
    formData.append('description', data.description);
  
    files.forEach(file => {
      formData.append('files', file);
    });
  
    let newUploadedFiles: string[] = [];
    uploadedFiles.forEach(uploadedFile => {
      newUploadedFiles = [...newUploadedFiles, uploadedFile.name]
    });

    formData.append('existingFiles', JSON.stringify(newUploadedFiles));
    setLoading(true);
    if (issue) {
      try {
        await axios.put(`/api/issue/${issue.id}`, formData);
        setLoading(false);
        openSnackbar('Poptávka byla úspěšně upravena!');
        closeModal();
        dispatch(setReload("issuepage"));
      } catch (error) {
        setLoading(false);
        openErrorSnackbar('Někde nastala chyba zkuste to znovu!');
        setError("apiError", {
          type: "server",
          message: "Někde nastala chyba zkuste to znovu",
        });
        console.error('Error editing issue:', error);
      }
    } else {
      try {
        const response = await axios.post('/api/issue', formData);
        setLoading(false);
        openSnackbar('Poptávka byla úspěšně vytvořena!');
        closeModal();
        dispatch(setReload("issue"));
        navigate(`/issue/${response.data.id}`);
      } catch (error) {
        openErrorSnackbar('Někde nastala chyba zkuste to znovu!');
        setLoading(false);
        setError("apiError", {
          type: "server",
          message: "Někde nastala chyba zkuste to znovu",
        });
        console.error('Error posting issue:', error);
      }
    }
  }

  return (
    <>
      {loading ?
        <LoadingScreen modal/>
      :
        <form className='new-issue' onSubmit={handleSubmit(handlePostIssue)}>
          <h1>{issue ? "Změnit pohledávku (issue)" : "Vytvořit pohledávku (issue)"}</h1>
          <label className='name'>Název</label>
          <input className={`${errors.name ? "border-red-600" : ""}`} placeholder='Zadejte název pohledávky...' {...register("name")} maxLength={100}/>
          <p className={`${errors.name ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.name?.message}!</p>
          <label className='repo'>Aplikace</label>
          <Dropdown
            label={selectValue !== 0 
              ? (repos.find((repo: RepoSelect) => repo.id === selectValue) || { name: "Vyberte aplikaci..." }).name
              : "Vyberte aplikaci..."
            }
            className={`select ${errors.repo ? "border-red-600" : ""} ${selectValue !== 0 ? "" : "unselected"} ${hoverSelect ? "darken" : ""}`}
            defaultClasses={false}
            menuClasses="options"
            noArrow={true}
          >
            {repos.map((repo: RepoSelect, index: number) => {
              return (
                <Dropdown.Item key={index} onClick={() => setSelectValue(repo.id)}>{repo.name}</Dropdown.Item>
              )
            })} 
          </Dropdown>
          <FontAwesomeIcon icon={faChevronDown} className="arrow"/>
          <p className={`${errors.repo ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.repo?.message}!</p>
          <div className='labels-wrapper'>
            <h2>Označení </h2>
            <div className='labels'>
              <div className='label'>
                <input type="checkbox" id="bug" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("bug")}/>
                <FontAwesomeIcon icon={faCheck} className="check"/>
                <label htmlFor="bug" className="bug">chyba</label>
              </div>
              <div className='label'>
                <input type="checkbox" id="enhancement" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("enhancement")}/>
                <FontAwesomeIcon icon={faCheck} className="check"/>
                <label htmlFor="enhancement" className="enhancement">vylepšení</label>
              </div>
              <div className='label'>
                <input type="checkbox" id="question" className={`${errors.labels ? "error" : ""}`} onChange={() => changeLabel("question")}/>
                <FontAwesomeIcon icon={faCheck} className="check"/>
                <label htmlFor="question" className="question">otázka</label>
              </div>
            </div>
          </div>
          <p className={`${errors.labels ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.labels?.message || (errors.labels?.[0]?.message)}!</p>
          <label className="description" htmlFor="description">Popis poptávky</label>
          <WysiwygEditor
            stripPastedStyles={true}
            editorState={descriptionEditorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName={`wrapperClassName ${errors.description ? "border-red-600" : ""} ${focusDescription ? "focused" : ""}`}
            editorClassName={`editorClassName`}
            editorStyle={{fontFamily: 'Plus Jakarta Sans'}}
            toolbar={{
              options: ['inline', 'blockType', 'list', 'emoji', 'remove', 'history'],
              inline: {options: ['bold', 'italic', 'underline', 'strikethrough']}
            }}
            localization={{ locale: 'en', translations: editorLabels }}
            onEditorStateChange={ (newState: any) => {
              let hasAtomicValue = false
              newState.getCurrentContent().blockMap.forEach((element: any) => {
                if (element.type === "atomic") hasAtomicValue = true
              })
              if (hasAtomicValue) {
                alert("Používáte nepodporované znaky. Zkopírujte text do poznámkového bloku a obsah znovu zkopírujte a vložte!");
                return;
              }
              const text = draftToHtml(convertToRaw(newState.getCurrentContent()));
              if (text.length > 8191) return alert('Popis nabídky nesmí být delší než 8191 raw znaků!');
              setDescriptionEditorState(newState);
              if (validate) setValue("description", text, { shouldValidate: true })
              else setValue("description", text);
            }}
          />
          <p className={`${errors.description ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.description?.message}!</p>
          <label className='attachments'>Přílohy</label>
          <div className='attachment-wrapper'>
            <input type='file' className='dropzone' onChange={addFile} id={"dropzone"}/>
            <span 
              onClick={() => document.getElementById("dropzone")?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              Sem klikněte nebo přetáhněte soubor...
            </span>
          </div>
          {files.map((file: File, index: number) => {
            return (
              <div className='attachment' key={index}>
                <span>{file.name}</span>
                <CloseIcon className="close-icon" onClick={() => onFileCloseButtonClick(index)} />
              </div>
            )
          })}
          {uploadedFiles.map((file: Attachment, index: number) => {
            return (
              <div className='attachment' key={index}>
                <span>{file.name}</span>
                <CloseIcon className="close-icon" onClick={() => onUploadedFileCloseButtonClick(index)} />
              </div>
            )
          })}
          {errors.apiError && (<p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>)}
          <div className='buttons'>
            <Button type="submit" onClick={() => setValidate(true)}>{issue ? "Změnit pohledávku" : "Vytvořit pohledávku"}</Button>
          </div>
        </form>
      }
    </>
  )
}

export default NewIssue;