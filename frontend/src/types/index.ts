export interface Company {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company_id: number;
  company: Company;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  company_name?: string;
  is_company?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface CircuitVersion {
  id: number;
  project_id: number;
  version_number: number;
  data_json: string;
  created_at: string;
}

export interface CircuitSimulation {
  id: number;
  project_id: number;
  task_id: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: Record<string, unknown>;
  created_at: string;
}

export interface AIAssistantRequest {
  prompt: string;
}

export interface AIAssistantResponse {
  answer: string;
}

export interface CircuitAnalysisRequest {
  circuit_description: string;
}

export interface CircuitAnalysisResponse {
  analysis: string;
  recommendations: string[];
  components: string[];
}

export type UserRole = "company_admin" | "user";

export type ProjectRole = "owner" | "editor" | "viewer";

export interface ApiError {
  detail:
    | string
    | Array<{
        type: string;
        loc: string[];
        msg: string;
        input: Record<string, unknown>;
      }>;
}
