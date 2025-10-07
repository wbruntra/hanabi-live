// Manages browser history state for back/forward button support.

import type { Screen } from "./types/Screen";

export interface NavigationState {
  screen: Screen;
  // Additional data for specific screens.
  friends?: boolean; // For history friends view.
}

// Push a new navigation state to the browser history. This allows the back/forward buttons to work.
export function pushNavigationState(
  state: NavigationState,
  url = "/lobby",
): void {
  globalThis.history.pushState(state, "", url);
}

// Replace the current navigation state without creating a new history entry. Used when we want to
// update the current state without allowing back navigation.
export function replaceNavigationState(
  state: NavigationState,
  url = "/lobby",
): void {
  globalThis.history.replaceState(state, "", url);
}

// Get the current navigation state from the history API.
export function getCurrentNavigationState(): NavigationState | null {
  return globalThis.history.state as NavigationState | null;
}
