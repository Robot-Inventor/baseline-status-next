import { defineConfig } from "oxlint";
import { oxlintNextConfigNoJSDoc } from "@robot-inventor/oxlint-config";

export default defineConfig({
    ...oxlintNextConfigNoJSDoc,
    rules: {
        "sort-keys": "off"
    }
});
