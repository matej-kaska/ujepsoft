import * as yup from 'yup';

export const emailSchema = yup.string()
  .required("Toto pole je povinné")
  .email("E-mail není ve validním formátu")
  // eslint-disable-next-line no-useless-escape
  .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "E-mail není ve validním formátu")
  .max(320, "E-mail není ve validním formátu");

export const passwordSchema = yup.string()
  .required("Toto pole je povinné")
  .min(8, "Heslo musí být minimálně 8 znaků dlouhé")
  .max(100, "Heslo nesmí být delší než 100 znaků");

export const confirmPasswordSchema = yup.string()
  .required("Toto pole je povinné")
  .oneOf([yup.ref("password")], "Hesla se neshodují");
