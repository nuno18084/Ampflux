import { useState } from "react";
import { useFormState } from "./useFormState";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, setLoading, setFormError } = useFormState();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setFormError("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    setLoading,
    setFormError,
    resetForm,
  };
};
