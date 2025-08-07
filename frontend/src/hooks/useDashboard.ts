import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "../lib/api";
import { useAuth } from "./useAuth";

export const useDashboard = () => {
  const { user } = useAuth();
  const queryKey = user ? ["projects", user.id] : ["projects"];

  const {
    data: projects,
    isLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey,
    queryFn: () => apiClient.getProjects(),
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const {
    data: sharedProjects,
    isLoading: sharedLoading,
    refetch: refetchSharedProjects,
  } = useQuery({
    queryKey: ["shared-projects", user?.id],
    queryFn: () => apiClient.getSharedProjects(),
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Refetch data when component mounts
  useEffect(() => {
    if (user) {
      refetchProjects();
      refetchSharedProjects();
    }
  }, [user, refetchProjects, refetchSharedProjects]);

  // Refetch data when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refetchProjects();
        refetchSharedProjects();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refetchProjects, refetchSharedProjects]);

  // Combine owned and shared projects, sort by updated_at
  const allProjects = [
    ...(projects || []),
    ...(sharedProjects || []).map((share) => ({
      ...share.project,
      isShared: true,
      sharedBy: share.shared_by_user,
      role: share.role,
    })),
  ].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const recentProjects = allProjects.slice(0, 3) || [];

  return {
    projects,
    sharedProjects,
    allProjects,
    recentProjects,
    isLoading: isLoading || sharedLoading,
    refetchProjects,
    refetchSharedProjects,
  };
};
