import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    include: ['tests/unit/**/*.{spec,test}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**', 'dist/**'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: { lines: 50, branches: 40, functions: 50, statements: 50 },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.spec.ts', '**/*.spec.tsx', '**/*.d.ts',
        'src/app/**/page.tsx', 'src/app/**/layout.tsx',
        'src/components/home/**',
        'src/components/workbench/**',
        'src/middleware.ts', 'src/i18n/**',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
