import { useState } from "react";

export const useFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(""); // Clear error when starting loading
    }
  };

  const setFormError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    setLoading,
    setFormError,
  };
};
