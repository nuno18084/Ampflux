import { apiClient } from "../lib/api";

// Login Handler
export const handleLogin = async (
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
  setFormError: (error: string) => void,
  navigate: (path: string) => void
) => {
  setLoading(true);
  setFormError("");

  try {
    await apiClient.login(email, password);
    navigate("/");
  } catch (error: any) {
    setFormError(error.response?.data?.detail || "Login failed");
  } finally {
    setLoading(false);
  }
};

// Register Handler
export const handleRegister = async (
  name: string,
  email: string,
  password: string,
  isCompany: boolean,
  companyName: string,
  setLoading: (loading: boolean) => void,
  setFormError: (error: string) => void,
  navigate: (path: string) => void
) => {
  setLoading(true);
  setFormError("");

  try {
    await apiClient.register({
      name,
      email,
      password,
      is_company: isCompany,
      company_name: companyName,
    });
    navigate("/login");
  } catch (error: any) {
    setFormError(error.response?.data?.detail || "Registration failed");
  } finally {
    setLoading(false);
  }
};

// Logout Handler
export const handleLogout = (logout: () => void, queryClient: any) => {
  logout();
  queryClient.clear();
};

// Form Reset Handler
export const resetForm = (
  setName: (name: string) => void,
  setEmail: (email: string) => void,
  setPassword: (password: string) => void,
  setShowPassword: (show: boolean) => void,
  setIsCompany: (isCompany: boolean) => void,
  setCompanyName: (companyName: string) => void
) => {
  setName("");
  setEmail("");
  setPassword("");
  setShowPassword(false);
  setIsCompany(false);
  setCompanyName("");
};
