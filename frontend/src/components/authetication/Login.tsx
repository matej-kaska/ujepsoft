import { useModal } from '../../contexts/ModalProvider';
import './Login.scss'
import Register from './Register';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "../../utils/axios";
import { useSnackbar } from '../../contexts/SnackbarProvider';
import { TUserInfo } from '../../types/userInfo';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../redux/authSlice';
import { useState } from 'react';
import { emailSchema, passwordSchema } from '../../utils/validationSchemas';
// TODO: import PasswordReset from 'components/password-reset/PasswordReset';

type Form = {
  email: string;
  password: string;
  apiError?: any;
}

const Login = () => {
  const { showModal, closeModal } = useModal();
  const { openSnackbar, openErrorSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [ rememberMe, setRememberMe ] = useState(false);

  const formSchema = yup.object().shape({
    email: emailSchema,
    password: passwordSchema
  });

  const {setError, register, handleSubmit, formState: { errors } } = useForm<Form>({ 
    resolver: yupResolver(formSchema)
  });

  const handleRegister = () => {
    showModal(<Register/>)
  }

  const handleLogin = (data: Form) => {
    axios.post("/api/users/auth/token",{
      email: data.email,
      password: data.password
    })
    .then((res: any) => {
      dispatch(setToken({
        token: res.data.token,
        rememberMe: rememberMe
      }));
      getUserInfo();
      openSnackbar("Jste úspěšně přihlášen!")
      closeModal();
    }).catch(err => {
      if (!err.response.data.en) {
        setError("apiError", {
          type: "server",
          message: "Někde nastala chyba zkuste to znovu",
        });
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
      } else if (err.response.data.en.includes("Invalid")) {
        setError("password", {
          type: "server",
          message: "Nesprávný e-mail nebo heslo"
        });
      } else {
        setError("apiError", {
          type: "server",
          message: "Někde nastala chyba zkuste to znovu",
        });
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
      }
    })
  }

  const getUserInfo = async () => {
    const response = await axios.get("/api/users/user");
    const newUserInfo: TUserInfo = {
      id: response.data.id,
      email: response.data.email,
      is_staff: response.data.is_staff,
    }
    dispatch(setUser({ userInfo: newUserInfo, rememberMe: rememberMe}))
  }

  return (
    <form className='login' onSubmit={handleSubmit(handleLogin)}>
      <h1 className='font-24-b'>Přihlásit se</h1>
      <label className='font-14'>E-mail:</label>
      <input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder='Zadejte e-mail...' {...register("email")}/>
      <p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
      <label className='font-14'>Heslo:</label>
      <input type="password" className={`${errors.password ? "border-red-600" : ""}`} placeholder='Zadejte heslo...' {...register("password")}/>
      <p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
      <div className='footer'>
        <div className='remember-me'>
          <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}/><label className='font-14' onClick={() => setRememberMe(!rememberMe)}>Zapamatovat si mě</label>
        </div>
        <span className='password-reset-label p-green-h'>Zapomenuté heslo</span>
      </div>
      <div className='buttons'>
        <button className='register-button s-green-bg-h p-green' type="button" onClick={handleRegister}>Zaregistrovat se</button>
        <button className='login-button p-green-bg-h l-green' type="submit">Přihlásit se</button>
      </div>
    </form>
  )
}

export default Login;