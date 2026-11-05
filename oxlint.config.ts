import { defineConfig } from "oxlint";
import { oxlintNextConfig } from "@robot-inventor/oxlint-config";

export default defineConfig({
    ...oxlintNextConfig,
    rules: {
        "sort-keys": "off"
    }
});
