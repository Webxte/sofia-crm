
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Configure React plugin
    react({
      // Use automatic JSX runtime
      jsxImportSource: "react",
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  // Optimize for React and ensure single instance
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true, // Force dependency re-optimization
    esbuildOptions: {
      define: {
        global: 'window'
      },
    },
  },
  build: {
    // Ensure React has only one instance
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Make sure React is externalized properly
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Force clear cache on each build
    cssCodeSplit: true,
  },
  // Force clear cache on each build
  cacheDir: '.vite_cache',
}));
