import * as yup from 'yup';

export const emailSchema = yup.string()
  .required("Toto pole je povinné")
  .email("E-mail není ve validním formátu")
  // eslint-disable-next-line no-useless-escape
  .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ujep\.cz|gmail\.com)$/, "E-mail není ve validním formátu")
  .max(320, "E-mail není ve validním formátu");

export const passwordSchema = yup.string()
  .required("Toto pole je povinné")
  .min(8, "Heslo musí být minimálně 8 znaků dlouhé")
  .max(100, "Heslo nesmí být delší než 100 znaků");

export const confirmPasswordSchema = yup.string()
  .required("Toto pole je povinné")
  .oneOf([yup.ref("password")], "Hesla se neshodují");

export const gdprSchema = yup.boolean()
  .required()
  .oneOf([true], "Musíte souhlasit se zpracováním osobních údajů")
