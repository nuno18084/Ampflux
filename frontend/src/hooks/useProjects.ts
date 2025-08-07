import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "../lib/api";
import { useAuth } from "./useAuth";

export const useProjects = () => {
  const { user } = useAuth();
  const queryKey = user ? ["projects", user.id] : ["projects"];

  const {
    data: projects,
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => apiClient.getProjects(),
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch shared projects
  const {
    data: sharedProjects,
    isLoading: sharedProjectsLoading,
    refetch: refetchSharedProjects,
  } = useQuery({
    queryKey: ["shared-projects"],
    queryFn: () => apiClient.getSharedProjects(),
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Refetch data when component mounts
  useEffect(() => {
    if (user) {
      refetch();
      refetchSharedProjects();
    }
  }, [user, refetch, refetchSharedProjects]);

  // Refetch data when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refetch();
        refetchSharedProjects();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refetch, refetchSharedProjects]);

  return {
    projects,
    sharedProjects,
    isLoading: isLoading || sharedProjectsLoading,
    refetch,
    refetchSharedProjects,
  };
};
