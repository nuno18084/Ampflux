import { useState, useEffect } from "react";

export const usePageLoading = (delay: number = 1000) => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { isPageLoading };
};
