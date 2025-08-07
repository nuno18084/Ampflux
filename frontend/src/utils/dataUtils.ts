// Date Formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateString);
  }
};

// Email Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password Validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Name Validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Project Name Validation
export const isValidProjectName = (name: string): boolean => {
  return name.trim().length >= 3;
};

// Component Type Validation
export const isValidComponentType = (type: string): boolean => {
  const validTypes = [
    "battery",
    "solar_panel",
    "generator",
    "capacitor",
    "inductor",
    "switch",
    "relay",
    "transistor",
    "diode",
    "resistor",
    "temperature_sensor",
    "pressure_sensor",
    "flow_sensor",
  ];
  return validTypes.includes(type);
};

// Circuit Data Validation
export const isValidCircuitData = (data: any): boolean => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.components) &&
    Array.isArray(data.connections)
  );
};

// Deep Clone Object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

// Debounce Function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle Function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate Unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Sort Projects by Date
export const sortProjectsByDate = (projects: any[]): any[] => {
  return [...projects].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at);
    const dateB = new Date(b.updated_at || b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
};

// Filter Projects by Search Term
export const filterProjectsBySearch = (
  projects: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm.trim()) return projects;

  const term = searchTerm.toLowerCase();
  return projects.filter((project) =>
    project.name.toLowerCase().includes(term)
  );
};
