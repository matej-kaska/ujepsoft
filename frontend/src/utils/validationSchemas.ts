import * as yup from "yup";

export const emailSchema = yup
	.string()
	.required("Toto pole je povinné")
	.email("E-mail není ve validním formátu")
	// eslint-disable-next-line no-useless-escape
	.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "E-mail není ve validním formátu")
	// eslint-disable-next-line no-useless-escape
	.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ujep\.cz|gmail\.com)$/, "E-mail musí mít doménu @ujep.cz")
	.max(320, "E-mail není ve validním formátu");

export const passwordSchema = yup.string().required("Toto pole je povinné").min(8, "Heslo musí být minimálně 8 znaků dlouhé").max(100, "Heslo nesmí být delší než 100 znaků");

export const confirmPasswordSchema = yup
	.string()
	.required("Toto pole je povinné")
	.oneOf([yup.ref("password")], "Hesla se neshodují");

export const gdprSchema = yup.boolean().required().oneOf([true], "Musíte souhlasit se zpracováním osobních údajů");

export const offerNameSchema = yup.string().required("Toto pole je povinné").min(6, "Název musí být minimálně 6 znaků dlouhý").max(100, "Název nesmí být delší než 100 znaků");

export const offerKeywordsSchema = yup
	.array(yup.string().required("Toto pole je povinné").max(63, "Klíčové slovo nesmí být delší než 63 znaků").min(1, "Klíčové slovo musí být minimálně 1 znak dlouhé"))
	.required("Toto pole je povinné")
	.min(1, "Musíte zadat alespoň jedno klíčové slovo")
	.max(20, "Nesmíte zadat více než 20 klíčových slov");

export const descriptionSchema = yup.string().required("Toto pole je povinné").min(32, "Popis musí být minimálně raw 32 znaků dlouhý").max(8192, "Název nesmí být delší než raw 8192 znaků");

export const urlGithubSchema = yup
	.string()
	.required("Toto pole je povinné")
	.matches(/^https:\/\/github\.com\//, 'URL musí začínat "https://github.com/"');

export const labelsSchema = yup
	.array(yup.string().required("Toto pole je povinné").oneOf(["bug", "question", "enhancement"], "Toto pole je povinné"))
	.required("Toto pole je povinné")
	.min(1, "Musíte vybrat alespoň 1 označení")
	.max(3, "Nesmíte vybrat více než 3 označení");

export const repoSelectSchema = yup.number().required("Toto pole je povinné").min(1, "Musíte vybrat repozitář");

export const commentSchema = yup.string().required("Toto pole je povinné").min(9, "Toto pole je povinné").max(8192, "Komentář nesmí být delší než raw 8192 znaků");