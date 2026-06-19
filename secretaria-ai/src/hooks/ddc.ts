// ZEHLA DDC - Cognitive OS Command Center
// Reusable Custom Hooks

import { useState, useEffect, useCallback } from 'react';
import type { GuestStatus, AIStatus } from '@/types/ddc';

// ============================================================================
// DASHBOARD STATE HOOK
// ============================================================================

interface DashboardState {
  activeTab: string;
  sidebarOpen: boolean;
  notificationsPanelOpen: boolean;
  aiStatus: AIStatus;
  selectedGuestId: string | null;
  selectedConversationId: string | null;
}

export function useDashboardState(initialState?: Partial<DashboardState>) {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    sidebarOpen: true,
    notificationsPanelOpen: false,
    aiStatus: 'online',
    selectedGuestId: null,
    selectedConversationId: null,
    ...initialState
  });

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notificationsPanelOpen: !prev.notificationsPanelOpen }));
  }, []);

  const selectGuest = useCallback((guestId: string | null) => {
    setState(prev => ({ ...prev, selectedGuestId: guestId }));
  }, []);

  const selectConversation = useCallback((conversationId: string | null) => {
    setState(prev => ({ ...prev, selectedConversationId: conversationId }));
  }, []);

  const setAIStatus = useCallback((status: AIStatus) => {
    setState(prev => ({ ...prev, aiStatus: status }));
  }, []);

  return {
    ...state,
    setActiveTab,
    toggleSidebar,
    toggleNotifications,
    selectGuest,
    selectConversation,
    setAIStatus
  };
}

// ============================================================================
// LOCAL STORAGE HOOK
// ============================================================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Key
      if ((event.ctrlKey || event.metaKey) && event.key in shortcuts) {
        event.preventDefault();
        shortcuts[event.key]();
      }

      // Check for Escape key
      if (event.key === 'Escape' && 'Escape' in shortcuts) {
        shortcuts['Escape']();
      }

      // Check for '?' key
      if (event.key === '?' && '?' in shortcuts) {
        event.preventDefault();
        shortcuts['?']();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// ============================================================================
// COPY TO CLIPBOARD HOOK
// ============================================================================

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  return { copied, copy };
}

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// GUEST STATUS COLOR HOOK
// ============================================================================

export function useGuestStatusColor(status: GuestStatus): string {
  const colors = {
    new: 'from-blue-500 to-cyan-500',
    warm: 'from-yellow-500 to-orange-500',
    hot: 'from-orange-500 to-red-500',
    booked: 'from-emerald-500 to-green-500',
    staying: 'from-purple-500 to-violet-500',
    checked_out: 'from-slate-500 to-gray-500',
    lost: 'from-gray-500 to-slate-500',
    inactive: 'from-gray-400 to-slate-400'
  };

  return colors[status] || colors.new;
}

// ============================================================================
// ANIMATION HOOK
// ============================================================================

export function useAnimationDelay(isVisible: boolean, delay: number = 0) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, delay]);

  return shouldAnimate;
}

// ============================================================================
// PREVIOUS VALUE HOOK
// ============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useState<T | undefined>(undefined);

  useEffect(() => {
    ref[1](value);
  }, [value]);

  return ref[0];
}

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// ============================================================================
// BREAKPOINT HOOKS
// ============================================================================

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

// ============================================================================
// PAGINATION HOOK
// ============================================================================

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}