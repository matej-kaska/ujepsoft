import postcsslightingcss from "postcss-lightningcss";
import tailwindcss from "tailwindcss";

export default {
	plugins: [
		tailwindcss(),
		postcsslightingcss({
			cssModules: false,
			browesrs: "default",
		}),
	],
};
