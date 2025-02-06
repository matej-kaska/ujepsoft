import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		plugins: {
			react,
			"react-compiler": reactCompiler,
			"@typescript-eslint": tsPlugin,
		},
		languageOptions: {
			parser: tsParser,
		},
		files: ["**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}"],
		rules: {
			"eqeqeq": "error",
			"import/no-unresolved": "off",
			"react-hooks/exhaustive-deps": "off",
			"jsx-a11y/click-events-have-key-events": "off",
			"react/jsx-uses-vars": "error",
		},
	},
];
