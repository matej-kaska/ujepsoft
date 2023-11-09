module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "overrides": [
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "import",
    "react",
    "@typescript-eslint",
    "jsx-a11y",
    "only-warn"
  ],
  "rules": {
    "eqeqeq": "error",
    "react/jsx-uses-react": "error",   
    "react/jsx-uses-vars": "error",
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "import/no-unresolved": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "react-hooks/exhaustive-deps": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
