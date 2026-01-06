import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
    {
        ignores: ["dist/", "node_modules/", "public/", "**/*.css", "**/*.scss"],
    },
    {
        files: ["**/*.{js,mjs,cjs,vue}"],
        plugins: {
            js,
            vue: pluginVue
        },
        languageOptions: {
            parser: vueParser,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                parser: js.configs.recommended.parser,
                extraFileExtensions: [".vue"],
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...pluginVue.configs["flat/recommended"].rules,
            "no-console": "warn",
            "no-unused-vars": "warn",
            "eqeqeq": ["error", "always"],
            "prefer-const": "error",
            "vue/multi-word-component-names": "off",
            "vue/html-indent": ["error", 2],
        },
    }
];