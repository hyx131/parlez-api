module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "no-console": "off",
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "no-restricted-syntax": "off",
    "import/newline-after-import": ["error", { "count": 2 }],
    "max-len": ["error", {"code": 120, "tabWidth": 2, "ignoreStrings": false, "ignoreTemplateLiterals": false,}],
  }
};
