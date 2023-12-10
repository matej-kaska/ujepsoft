import { useModal } from '../../contexts/ModalProvider';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "../../utils/axios";
import Button from 'components/buttons/Button';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { offerKeywordsSchema, offerNameSchema, descriptionSchema } from 'utils/validationSchemas';
import { useEffect, useState } from 'react';
import { ReactComponent as CloseIcon } from '../../images/close.svg';
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import "./react-draft-wysiwyg.css";
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from 'redux/reloadSlice';

type Form = {
  name: string;
  keywords: string[];
  description: string;
  apiError?: any;
}

const NewOffer = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordsInputValue, setKeywordsInputValue] = useState<string>("");
  const [descriptionEditorState, setDescriptionEditorState] = useState(EditorState.createEmpty());
  const [validate, setValidate] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [files, setFiles] = useState<File[]>([]);
  const { closeModal } = useModal();
  const { openSnackbar, openErrorSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    if (validate) setValue("keywords", keywords, { shouldValidate: true })
    else setValue("keywords", keywords);
  }, [keywords])

  const formSchema = yup.object().shape({
    name: offerNameSchema,
    keywords: offerKeywordsSchema,
    description: descriptionSchema
  });

  const {setError, register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({ 
    resolver: yupResolver(formSchema)
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && keywordsInputValue === '') {
      if (keywords.length > 0) {
        setKeywords((prev: string[]) => {
          return prev.slice(0, prev.length - 1)
        });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (keywordsInputValue.trim() !== '') {
        if (keywords.length > 19 || keywords.includes(keywordsInputValue.trim())) return;
        setKeywords((prev: string[]) => {
          return [...prev, keywordsInputValue.trim()]
        });
        setKeywordsInputValue('');
      }
    }
  };

  const onKeywordCloseButtonClick = (keyword: string) => {
    setKeywords((prev: string[]) => {
      return prev.filter((prevKeyword: string) => prevKeyword !== keyword)
    });
  }

  const onFileCloseButtonClick = (index: number) => {
    setFiles((prev: File[]) => {
      return prev.filter((_file: File, fileIndex: number) => fileIndex !== index)
    });
  }

  const validateSize = (file: File) => {
    if (file.size > 134217728) {openErrorSnackbar("Soubor nesmí být větší než 128 MB!"); return false;}
    let totalSize: number = 0;
    files.forEach((file: File) => {
      totalSize += file.size;
    })
    if (totalSize + file.size > 536870912) {openErrorSnackbar("Soubory nesmí být větší než 512 MB!"); return false;}
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
      if (!validateSize(e.dataTransfer.files[0])) {e.dataTransfer.clearData();return;}
      setFiles((prev: File[]) => {
        return [...prev, e.dataTransfer.files[0]]
      });
      e.dataTransfer.clearData();
    }
  };

  const handlePostOffer = async (data: Form) => {
    if (!userInfo.id) return;
    
    const encodeFileToBase64 = (file: File) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    const filesBase64 = await Promise.all(
      files.map((file) => encodeFileToBase64(file))
    );

    const postData = {
      name: data.name,
      keywords: data.keywords,
      description: data.description,
      files: filesBase64.map((base64: any, index) => {
        const content = base64.split(',')[1];
        return {
          name: files[index].name,
          content: content,
        };
      })
    };

    try {
      const response = await axios.post('/api/offer', postData);
      console.log(response);
      openSnackbar('Nabídka byla úspěšně vytvořena!');
      closeModal();
      dispatch(setReload("offer"));
      // TODO: navigate to offer detail
    } catch (error) {
      openErrorSnackbar('Někde nastala chyba zkuste to znovu!');
      setError("apiError", {
        type: "server",
        message: "Někde nastala chyba zkuste to znovu",
      });
      console.error('Error posting offer:', error);
    }
  }

  return (
    <form className='new-offer' onSubmit={handleSubmit(handlePostOffer)}>
      <h1>Vytvořit nabídku</h1>
      <label className='name'>Název</label>
      <input className={`${errors.name ? "border-red-600" : ""}`} placeholder='Zadejte název nabídky...' {...register("name")}/>
      <p className={`${errors.name ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.name?.message}!</p>
      <div className='keywords-wrapper'>
        <div className="keywords-container">
          <label htmlFor="keywords-input">Klíčová slova: </label>
          <div className="keywords">
            {keywords.length ? null :
              <span className="add-keyword">Pro přidání klíčového slova stikněte Enter...</span>
            }
            {keywords.map((keyword, index) => (
              <div key={index} className="keyword-tag">
                <div className="keyword-name">{keyword}</div>
                <CloseIcon className="close-icon" onClick={() => onKeywordCloseButtonClick(keyword)} />
              </div>
            ))}
          </div>
        </div>
        <input
          type="text"
          className={`${errors.keywords ? "border-red-600" : ""} keywords-input`}
          id='keywords-input'
          placeholder='Zadejte klíčové slovo...'
          maxLength={63}
          value={keywordsInputValue}
          onChange={(e) => setKeywordsInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p className={`${errors.keywords ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.keywords?.message || (errors.keywords?.[0]?.message)}!</p>
      <label className="description" htmlFor="description">Popis nabídky</label>
      <WysiwygEditor
        stripPastedStyles={true}
        editorState={descriptionEditorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName={`wrapperClassName ${errors.description ? "border-red-600" : ""}`}
        editorClassName="editorClassName"
        editorStyle={{fontFamily: 'Plus Jakarta Sans'}}
        toolbar={{
          options: ['inline', 'fontSize', 'list', 'emoji', 'remove', 'history'],
          inline: {options: ['bold', 'italic', 'underline', 'strikethrough']}
        }}
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
      {errors.apiError && (<p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>)}
      <div className='buttons'>
        <Button type="submit" onClick={() => setValidate(true)}>Vytvořit nabídku</Button>
      </div>
    </form>
  )
}

export default NewOffer;