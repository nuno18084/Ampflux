import { useState } from "react";
import { useFormState } from "./useFormState";

export const useRegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const { isLoading, error, setLoading, setFormError } = useFormState();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setIsCompany(false);
    setCompanyName("");
    setFormError("");
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isCompany,
    setIsCompany,
    companyName,
    setCompanyName,
    isLoading,
    error,
    setLoading,
    setFormError,
    resetForm,
  };
};
