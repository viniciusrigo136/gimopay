import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts", "src/**/*.test.tsx"], environment: "node" },
      },
      {
        extends: true,
        // Banco compartilhado: arquivos em série.
        test: { name: "db", include: ["tests/db/**/*.test.ts"], fileParallelism: false, testTimeout: 20000, hookTimeout: 30000 },
      },
    ],
  },
});
