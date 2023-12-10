import { useModal } from '../../contexts/ModalProvider';
import Register from './Register';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "../../utils/axios";
import { useSnackbar } from '../../contexts/SnackbarProvider';
import { TUserInfo } from '../../types/userInfo';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../redux/authSlice';
import { useEffect, useState } from 'react';
import { emailSchema, passwordSchema } from '../../utils/validationSchemas';
import Button from 'components/buttons/Button';
import LoadingScreen from 'components/loading-screen/LoadingScreen';
import PasswordReset from 'components/password-reset/PasswordReset';

type Form = {
  email: string;
  password: string;
  apiError?: any;
}

type LoginProps = {
  token?: string;
}

const Login = ({token}: LoginProps) => {
  const { showModal, closeModal } = useModal();
  const { openSnackbar, openErrorSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [ rememberMe, setRememberMe ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    validateToken();
  }, [])

  const validateToken = async () => {
    axios.post("/api/users/register/validate", {token: token})
    .then(() => {
      openSnackbar("Účet byl úspěšně aktivován!");
      setLoading(false);
    })
    .catch((response: any) => {
      if (response.response.data.cz) {
        openErrorSnackbar(response.response.data.cz + "!", true, true);
      } else {
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!", true, true);
      }
    })
    setLoading(false);
  }

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
      {loading ?
        <LoadingScreen login/>
      :
       <>
          <h1>Přihlásit se</h1>
          <label>E-mail:</label>
          <input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder='Zadejte e-mail...' {...register("email")}/>
          <p className={`${errors.email ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.email?.message}!</p>
          <label>Heslo:</label>
          <input type="password" className={`${errors.password ? "border-red-600" : ""}`} placeholder='Zadejte heslo...' {...register("password")}/>
          <p className={`${errors.password ? "visible" : "invisible"} ml-0.5 text-sm text-red-600`}>{errors.password?.message}!</p>
          <div className='footer'>
            <div className='remember-me'>
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}/><label onClick={() => setRememberMe(!rememberMe)}>Zapamatovat si mě</label>
            </div>
            <span className='password-reset-label' onClick={() => showModal(<PasswordReset/>)}>Zapomenuté heslo</span>
          </div>
          {errors.apiError && (<p className="ml-0.5 text-sm text-red-600">Někde nastala chyba zkuste to znovu!</p>)}
          <div className='buttons'>
            <Button color='secondary' type="button" onClick={handleRegister}>Zaregistrovat se</Button>
            <Button type="submit">Přihlásit se</Button>
          </div>
        </>
      }
    </form>
  )
}

export default Login;