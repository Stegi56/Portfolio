import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: For repo pages (not username.github.io), base is set dynamically in the CI workflow.
// Locally it's fine to keep default.
export default defineConfig({
  plugins: [react()],
});
