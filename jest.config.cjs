const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Baris di bawah ini adalah "sulap" paling penting.
  // Karena kodemu menggunakan import dengan akhiran .js (contoh: import db from "./lib/db.js"),
  // Jest akan kebingungan mencari file .js tersebut karena belum di-compile.
  // moduleNameMapper ini menyuruh Jest: "Abaikan akhiran .js, cari file aslinya (.ts)".
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
