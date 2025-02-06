import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";

export default [
	{
		plugins: {
			react: react,
			"react-compiler": reactCompiler,
		},
		rules: {
			eqeqeq: "error",
			"import/no-unresolved": "off",
			"react-hooks/exhaustive-deps": "off",
			"jsx-a11y/click-events-have-key-events": "off",
			"react/jsx-uses-vars": "error",
		},
	},
];
