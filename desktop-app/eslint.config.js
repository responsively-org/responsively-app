const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    extends: "erb",

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "import/no-extraneous-dependencies": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-filename-extension": "off",
        "import/extensions": "off",
        "import/no-unresolved": "off",
        "import/no-import-module-exports": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
    },

    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        parserOptions: {},
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
                moduleDirectory: ["node_modules", "src/"],
            },

            webpack: {
                config: require.resolve("./.erb/configs/webpack.config.eslint.ts"),
            },

            typescript: {},
        },

        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
    },
}, globalIgnores([
    "**/logs",
    "**/*.log",
    "**/pids",
    "**/*.pid",
    "**/*.seed",
    "**/coverage",
    "**/.eslintcache",
    "**/node_modules",
    "**/.DS_Store",
    "release/app/dist",
    "release/build",
    ".erb/dll",
    "**/.idea",
    "**/npm-debug.log.*",
    "**/*.css.d.ts",
    "**/*.sass.d.ts",
    "**/*.scss.d.ts",
    "!**/.erb",
])]);
