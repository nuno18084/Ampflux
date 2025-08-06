import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type {
  User,
  UserCreate,
  UserLogin,
  Token,
  Project,
  ProjectCreate,
  CircuitVersion,
  CircuitSimulation,
  AIAssistantRequest,
  AIAssistantResponse,
  CircuitAnalysisRequest,
  CircuitAnalysisResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.log("Adding auth token to request:", config.url);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("No auth token found for request:", config.url);
      }
      return config;
    });

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log("401 error, attempting token refresh...");
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem("access_token", response.access_token);
              localStorage.setItem("refresh_token", response.refresh_token);
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              console.log("Token refresh failed, logging out");
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
              return Promise.reject(refreshError);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: UserCreate): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async login(credentials: UserLogin): Promise<Token> {
    const response: AxiosResponse<Token> = await this.client.post(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async shareProject(
    projectId: number,
    email: string,
    role: string = "viewer"
  ): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      `/projects/${projectId}/share`,
      { email, role }
    );
    return response.data;
  }

  async getSharedProjects(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      "/projects/shared/with-me"
    );
    return response.data;
  }

  async acceptProjectShare(projectId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      `/projects/${projectId}/accept-share`
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    const response: AxiosResponse<Token> = await this.client.post(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get("/users/me");
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.client.get("/users/");
    return response.data;
  }

  // Project endpoints
  async createProject(projectData: ProjectCreate): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.post(
      "/projects/",
      projectData
    );
    return response.data;
  }

  async getProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await this.client.get(
      "/projects/"
    );
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.get(
      `/projects/${id}`
    );
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  async getProjectMembers(projectId: number): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      `/projects/${projectId}/members`
    );
    return response.data;
  }

  async getProjectPermissions(projectId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(
      `/projects/${projectId}/permissions`
    );
    return response.data;
  }

  async getCompanyUsers(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      `/projects/company/users`
    );
    return response.data;
  }

  async addTestUsers(): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      `/projects/add-test-users`
    );
    return response.data;
  }

  async addProjectMember(
    projectId: number,
    userId: number,
    role: string
  ): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      `/projects/${projectId}/add_member`,
      { user_id: userId, role }
    );
    return response.data;
  }

  async removeProjectMember(projectId: number, userId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      `/projects/${projectId}/remove_member`,
      { user_id: userId }
    );
    return response.data;
  }

  // Circuit endpoints
  async saveCircuitVersion(
    projectId: number,
    dataJson: string
  ): Promise<CircuitVersion> {
    const response: AxiosResponse<CircuitVersion> = await this.client.post(
      `/circuits/${projectId}/save_version`,
      { data_json: dataJson }
    );
    return response.data;
  }

  async getCircuitVersions(projectId: number): Promise<CircuitVersion[]> {
    const response: AxiosResponse<CircuitVersion[]> = await this.client.get(
      `/circuits/${projectId}/versions`
    );
    return response.data;
  }

  async simulateCircuit(
    projectId: number,
    circuitData: string
  ): Promise<CircuitSimulation> {
    const response: AxiosResponse<CircuitSimulation> = await this.client.post(
      `/circuits/${projectId}/simulate`,
      { circuit_data: circuitData }
    );
    return response.data;
  }

  async getSimulationResult(taskId: string): Promise<CircuitSimulation> {
    const response: AxiosResponse<CircuitSimulation> = await this.client.get(
      `/circuits/simulation_result/${taskId}`
    );
    return response.data;
  }

  // AI endpoints
  async getAIAssistant(
    request: AIAssistantRequest
  ): Promise<AIAssistantResponse> {
    const response: AxiosResponse<AIAssistantResponse> = await this.client.post(
      "/ai/assistant",
      request
    );
    return response.data;
  }

  async analyzeCircuit(
    request: CircuitAnalysisRequest
  ): Promise<CircuitAnalysisResponse> {
    const response: AxiosResponse<CircuitAnalysisResponse> =
      await this.client.post("/ai/analyze", request);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    console.log("Checking authentication, token exists:", !!token);
    return !!token;
  }

  logout(): void {
    console.log("Logging out, clearing tokens");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  setTokens(token: Token): void {
    console.log("Setting tokens");
    localStorage.setItem("access_token", token.access_token);
    localStorage.setItem("refresh_token", token.refresh_token);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
