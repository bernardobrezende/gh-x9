module.exports = {
  "env": {
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "extends": "eslint:recommended",
  "installedESLint": true,
  "globals": {
    "angular": true,
    "console": true,
    "require": true,
    "module": true,
    "process": true,
    "exports": true,
  },
  "rules": {
    "prefer-const": [ "error" ],
    "no-console": [ "warn" ],
    "no-extra-boolean-cast": [ "warn" ],
    "indent": [ "error", 2 ],
    "no-mixed-spaces-and-tabs": [ "error" ]
  }
};