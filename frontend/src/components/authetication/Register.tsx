import { useModal } from '../../contexts/ModalProvider';
import Login from './Login';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "../../utils/axios";
import { useState } from 'react';
import { useSnackbar } from '../../contexts/SnackbarProvider';
import { emailSchema, passwordSchema, confirmPasswordSchema } from '../../utils/validationSchemas';
import Button from 'components/buttons/Button';
import { Link } from 'react-router-dom';

type Form = {
  email: string;
  password: string;
  confirmPwd: string;
  gdpr: boolean;
  apiError?: any;
}

const Register = () => {
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState<boolean>(false);
  const [isApiError, setIsApiError] = useState<boolean>(false);
  const { showModal } = useModal();
  const { openErrorSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({
    email: emailSchema,
    password: passwordSchema,
    confirmPwd: confirmPasswordSchema
  });

  const {setError, register, handleSubmit, formState: { errors } } = useForm<Form>({ 
    resolver: yupResolver(formSchema)
  });

  const handleLogin = () => {
    showModal(<Login/>)
  };

  const handleRegister = (data: Form) => {
    axios.post("/api/users/register",{
      email: data.email,
      password: data.password,
      password_again: data.confirmPwd
    })
    .then(() => {
      setIsSuccessfullySubmitted(true);
      setTimeout(() => {
        showModal(<Login/>)
      }, 750);
    }).catch(err => {
      if (!err.response.data.en) {
        setError("apiError", {
          type: "server",
          message: "Někde nastala chyba zkuste to znovu",
        });
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!")
      } else if (err.response.data.en.includes("already taken")) {
        setError("email", {
          type: "server",
          message: 'Tento e-mail je již používán',
        });
      } else {
        setError('apiError', {
          type: "server",
          message: 'Někde nastala chyba zkuste to znovu',
        });
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!")
      }
    })
  }

  return (
    <form className='register' onSubmit={handleSubmit(handleRegister)}>
      <h1>Zaregistrovat se</h1>
      <label>E-mail:</label>
      <input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder='Zadejte e-mail...' {...register("email")}/>
      <p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
      <label>Heslo:</label>
      <input type="password" className={`${errors.password ? "border-red-600" : ""}`} placeholder='Zadejte heslo...' {...register("password")}/>
      <p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
      <label>Heslo znovu:</label>
      <input type="password" className={`${errors.confirmPwd ? "border-red-600" : ""}`} placeholder='Zadejte heslo znovu...' {...register("confirmPwd")}/>
      <p className={`${errors.confirmPwd ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.confirmPwd?.message}!</p>
      <div className='gdpr-wrapper-check'>
        <input id='gdpr' type="checkbox" {...register("gdpr")}/><label className='font-14' htmlFor='gdpr'>Souhlasím se <Link to={"/gdpr"} target="_blank" rel="noopener noreferrer">zpracováním osobních údajů</Link></label>
        <p className={`${errors.gdpr ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.gdpr?.message}!</p>
      </div>
      {isSuccessfullySubmitted && (<p className="ml-0.5 text-sm text-green-600 successfullySubmitted">Registrace proběhla v pořádku.</p>)}
      {isApiError && (<p className="ml-0.5 text-sm text-red-600 successfullySubmitted">Někde nastala chyba zkuste to znovu!</p>)}
      <div className='buttons'>
        <Button color="secondary" type="button" onClick={handleLogin}>Přihlásit se</Button>
        <Button type="submit">Zaregistrovat se</Button>
      </div>
    </form>
  )
}

export default Register;