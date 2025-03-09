export const errorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};
