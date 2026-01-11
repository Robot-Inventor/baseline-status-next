import { defineConfig } from "eslint/config";
import { eslintNextConfigNoJSDoc } from "@robot-inventor/eslint-config";

export default defineConfig(...eslintNextConfigNoJSDoc, {
    rules: {
        "sort-keys": "off"
    }
});
