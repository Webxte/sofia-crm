// Temporary simple toast replacement to avoid sonner dependency
export const toast = {
  success: (title: string, options?: { description?: string }) => {
    console.log(`✅ ${title}`, options?.description || '');
  },
  error: (title: string, options?: { description?: string }) => {
    console.error(`❌ ${title}`, options?.description || '');
  },
  warning: (title: string, options?: { description?: string }) => {
    console.warn(`⚠️ ${title}`, options?.description || '');
  }
};