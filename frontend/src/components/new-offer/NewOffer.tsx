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
import { useSelector } from 'react-redux';

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
  const { closeModal } = useModal();
  const { openSnackbar, openErrorSnackbar } = useSnackbar();

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

  const handlePostOffer = async (data: Form) => {
    setValidate(true);
    console.info(data);
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
        wrapperClassName={`wrapperClassName ${errors.keywords ? "border-red-600" : ""}`}
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
      <div className='buttons'>
        <Button type="submit">Vytvořit nabídku</Button>
      </div>
    </form>
  )
}

export default NewOffer;