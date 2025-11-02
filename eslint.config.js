// ESLint Flat Config for ESLint 9+
export default [
  {
    ignores: ["node_modules/**", "*.min.js", "dist/**", "build/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        console: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        CustomEvent: "readonly",
        Event: "readonly",
        // Three.js
        THREE: "readonly",
        // Node.js globals
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // Standard globals
        Math: "readonly",
        Date: "readonly",
        JSON: "readonly",
        Object: "readonly",
        Array: "readonly",
        String: "readonly",
        Number: "readonly",
        Boolean: "readonly",
        Promise: "readonly",
        Error: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "no-console": "off",
      "no-undef": "error",
      "no-redeclare": "error",
      "no-unused-expressions": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
      "eqeqeq": ["warn", "always"],
      "curly": ["warn", "all"],
      "no-empty": "warn",
      "no-implicit-coercion": "warn",
      "no-shadow": "warn",
      "no-empty-function": "warn",
      "no-useless-return": "warn"
    }
  }
];

