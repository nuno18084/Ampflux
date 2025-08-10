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
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for cookies
    });

    // Add request interceptor to handle auth
    this.client.interceptors.request.use((config) => {
      // Cookies are automatically sent with withCredentials: true
      console.log("Making request to:", config.url, "with config:", {
        method: config.method,
        headers: config.headers,
        withCredentials: config.withCredentials,
      });
      return config;
    });

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        console.error("API Error:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        // Only retry once and only for 401 errors
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.headers?.["X-Refresh-Request"]
        ) {
          console.log("401 error, attempting token refresh...");
          originalRequest._retry = true;

          try {
            // Prevent multiple simultaneous refresh requests
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshToken();
            }

            await this.refreshPromise;
            this.refreshPromise = null;

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            console.log("Token refresh failed");
            this.refreshPromise = null;
            // Don't redirect automatically - let the component handle it
            return Promise.reject(refreshError);
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

  async login(credentials: UserLogin): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear any client-side state
      this.clearAuthState();
    }
  }

  async refreshToken(): Promise<Token> {
    try {
      const response: AxiosResponse<Token> = await this.client.post(
        "/auth/refresh",
        {},
        {
          headers: { "X-Refresh-Request": "true" }, // Mark as refresh request
        }
      );
      return response.data;
    } catch (error) {
      console.error("Refresh token failed:", error);
      throw error;
    }
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

  async getProjectShares(projectId: number): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      `/projects/${projectId}/shares`
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
    // Since we're using httpOnly cookies, we can't directly check
    // We'll rely on the server to tell us if we're authenticated
    // This will be checked when making API calls
    return true; // Will be validated by server
  }

  clearAuthState(): void {
    console.log("Clearing auth state");
    // Clear any client-side state if needed
    // Cookies are cleared by the server
  }

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // Legacy methods for compatibility (deprecated)
  setTokens(token: Token): void {
    console.warn("setTokens is deprecated - using httpOnly cookies now");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
