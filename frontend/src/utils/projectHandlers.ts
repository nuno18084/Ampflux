import { apiClient } from "../lib/api";

// Project Creation Handler
export const handleCreateProject = async (
  e: React.FormEvent,
  projectName: string,
  setIsCreating: (creating: boolean) => void,
  setProjectName: (name: string) => void,
  setShowCreateForm: (show: boolean) => void,
  refetch: () => void
) => {
  e.preventDefault();
  if (!projectName.trim()) return;

  setIsCreating(true);
  try {
    await apiClient.createProject({ name: projectName });
    setProjectName("");
    setShowCreateForm(false);
    refetch();
  } catch (error) {
    console.error("Failed to create project:", error);
  } finally {
    setIsCreating(false);
  }
};

// Project Deletion Handler
export const handleDeleteProject = async (id: number, refetch: () => void) => {
  if (window.confirm("Are you sure you want to delete this project?")) {
    try {
      await apiClient.deleteProject(id);
      refetch();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }
};

// Navigation Handler
export const handleNavigate = (
  path: string,
  navigate: (path: string) => void,
  setIsNavigating: (navigating: boolean) => void
) => {
  setIsNavigating(true);
  navigate(path);
};

// Project Share Handler
export const handleShareProject = async (
  projectId: number,
  email: string,
  role: string,
  setShareModalOpen: (open: boolean) => void,
  setEmail: (email: string) => void,
  setRole: (role: string) => void
) => {
  try {
    await apiClient.shareProject(projectId, email, role);
    setShareModalOpen(false);
    setEmail("");
    setRole("viewer");
  } catch (error) {
    console.error("Failed to share project:", error);
  }
};
