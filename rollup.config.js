import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      exports: "named",
    },
    {
      file: "dist/index.js",
      format: "es",
    },
  ],
  external: ["axios"],
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
