export const debugLog = (context: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}] ${message}`, data ? '\nData:', data : '');
  }
};

export const debugError = (context: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
    if (error.response) {
      console.error('[Response Data]:', error.response.data);
      console.error('[Response Status]:', error.response.status);
      console.error('[Response Headers]:', error.response.headers);
    }
  }
}; 