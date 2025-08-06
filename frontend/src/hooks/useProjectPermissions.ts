import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useAuth } from "./useAuth";

export interface ProjectPermissions {
  canEdit: boolean;
  canView: boolean;
  canShare: boolean;
  canDelete: boolean;
  role: "viewer" | "editor" | "owner" | null;
  isLoading: boolean;
}

export const useProjectPermissions = (
  projectId: number
): ProjectPermissions => {
  const { user } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["project-permissions", projectId],
    queryFn: () => apiClient.getProjectPermissions(projectId),
    enabled: !!projectId && !!user,
  });

  if (!user || isLoading) {
    return {
      canEdit: false,
      canView: false,
      canShare: false,
      canDelete: false,
      role: null,
      isLoading: true,
    };
  }

  if (!permissions) {
    return {
      canEdit: false,
      canView: false,
      canShare: false,
      canDelete: false,
      role: null,
      isLoading: false,
    };
  }

  return {
    canEdit: permissions.can_edit,
    canView: permissions.can_view,
    canShare: permissions.can_share,
    canDelete: permissions.can_delete,
    role: permissions.role,
    isLoading: false,
  };
};
