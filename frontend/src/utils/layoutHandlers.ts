// Logout Handler
export const handleLogout = (
  logout: () => void,
  setIsDropdownOpen: (open: boolean) => void
) => {
  logout();
  setIsDropdownOpen(false);
};

// Click Outside Handler
export const handleClickOutside = (
  event: MouseEvent,
  dropdownRef: React.RefObject<HTMLDivElement>,
  buttonRef: React.RefObject<HTMLButtonElement>,
  setIsDropdownOpen: (open: boolean) => void
) => {
  if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node) &&
    buttonRef.current &&
    !buttonRef.current.contains(event.target as Node)
  ) {
    setIsDropdownOpen(false);
  }
};

// Dropdown Position Calculator
export const getDropdownPosition = (
  buttonRef: React.RefObject<HTMLButtonElement>
) => {
  if (!buttonRef.current) return { top: 0, right: 0 };
  const rect = buttonRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + window.scrollY + 8,
    right: window.innerWidth - rect.right,
  };
};

// Theme Toggle Handler
export const handleThemeToggle = (theme: string, toggleTheme: () => void) => {
  toggleTheme();
};

// Search Input Handlers
export const handleSearchChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setSearchTerm: (term: string) => void
) => {
  setSearchTerm(e.target.value);
};

export const handleSearchFocus = (
  e: React.FocusEvent<HTMLInputElement>,
  setIsSearchFocused: (focused: boolean) => void
) => {
  setIsSearchFocused(true);
};

export const handleSearchBlur = (
  e: React.FocusEvent<HTMLInputElement>,
  setIsSearchFocused: (focused: boolean) => void
) => {
  setIsSearchFocused(false);
};
