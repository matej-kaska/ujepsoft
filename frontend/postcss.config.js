import tailwindcss from 'tailwindcss';
import purgecss from '@fullhuman/postcss-purgecss';
import postcsslightingcss from 'postcss-lightningcss';

export default {
  plugins: [
    tailwindcss(),
    purgecss({
      content: [
				'./src/**/*.html', 
				'./src/**/*.tsx',
				'./src/**/*.ts',
				'./src/**/*.js',
				'./src/**/*.jsx',
				'./src/**/*.scss',
				'./src/**/*.css',
      ]
    }),
		postcsslightingcss({
			cssModules: false,
			browesrs: "default"
		})
  ],
};
