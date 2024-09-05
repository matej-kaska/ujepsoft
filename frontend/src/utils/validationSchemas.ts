import * as yup from "yup";
import { array, boolean, number, string } from "yup";

export const emailSchema = string()
	.required("Toto pole je povinné")
	.email("E-mail není ve validním formátu")
	.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "E-mail není ve validním formátu")
	// TODO: CHANGE THIS on Production
	.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(?!students\.)(([^@.]+\.)*ujep\.cz)$/, "E-mail musí mít doménu @ujep.cz (mimo students)")
	.max(320, "E-mail není ve validním formátu");

export const passwordSchema = string().required("Toto pole je povinné").min(8, "Heslo musí být minimálně 8 znaků dlouhé").max(100, "Heslo nesmí být delší než 100 znaků");

export const confirmPasswordSchema = string()
	.required("Toto pole je povinné")
	.oneOf([yup.ref("password")], "Hesla se neshodují");

export const gdprSchema = boolean().required().oneOf([true], "Musíte souhlasit se zpracováním osobních údajů");

export const offerNameSchema = string().required("Toto pole je povinné").min(2, "Název musí být minimálně 2 znaků dlouhý").max(100, "Název nesmí být delší než 100 znaků");

export const offerKeywordsSchema = array(yup.string().required("Toto pole je povinné").max(63, "Klíčové slovo nesmí být delší než 63 znaků").min(1, "Klíčové slovo musí být minimálně 1 znak dlouhé"))
	.required("Toto pole je povinné")
	.min(1, "Musíte zadat alespoň jedno klíčové slovo")
	.max(20, "Nesmíte zadat více než 20 klíčových slov");

export const descriptionSchema = string().required("Toto pole je povinné").min(32, "Popis musí být minimálně raw 32 znaků dlouhý").max(8192, "Název nesmí být delší než raw 8192 znaků");

export const urlGithubSchema = string()
	.required("Toto pole je povinné")
	.matches(/^https:\/\/github\.com\//, 'URL musí začínat "https://github.com/"');

export const labelsSchema = array(yup.string().required("Toto pole je povinné").oneOf(["bug", "question", "enhancement"], "Toto pole je povinné"))
	.required("Toto pole je povinné")
	.min(1, "Musíte vybrat alespoň 1 označení")
	.max(3, "Nesmíte vybrat více než 3 označení");

export const repoSelectSchema = number().required("Toto pole je povinné").min(1, "Musíte vybrat repozitář");

export const commentSchema = string().required("Toto pole je povinné").min(9, "Toto pole je povinné").max(8192, "Komentář nesmí být delší než raw 8192 znaků");
