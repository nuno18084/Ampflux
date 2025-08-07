// Circuit Handlers
export {
  handleDragStart,
  handleDrop,
  handleDragOver,
  handleComponentMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleKeyDown,
  handleComponentClick,
  handleConnectionDotClick,
  handleComponentDelete,
  handlePropertyChange,
} from "./circuitHandlers";

// Project Handlers
export {
  handleCreateProject,
  handleDeleteProject,
  handleNavigate,
  handleShareProject,
} from "./projectHandlers";

// Layout Handlers
export {
  handleLogout,
  handleClickOutside,
  getDropdownPosition,
  handleThemeToggle,
  handleSearchChange,
  handleSearchFocus,
  handleSearchBlur,
} from "./layoutHandlers";

// Auth Handlers
export {
  handleLogin,
  handleRegister,
  handleLogout as handleAuthLogout,
  resetForm,
} from "./authHandlers";

// Data Utils
export {
  formatDate,
  formatRelativeDate,
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidProjectName,
  isValidComponentType,
  isValidCircuitData,
  deepClone,
  debounce,
  throttle,
  generateId,
  sortProjectsByDate,
  filterProjectsBySearch,
} from "./dataUtils";
