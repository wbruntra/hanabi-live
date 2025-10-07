// Handles browser back/forward navigation using the History API.

import { globals } from "../Globals";
import * as history from "./history";
import type { NavigationState } from "./navigationState";
import {
  getCurrentNavigationState,
  replaceNavigationState,
} from "./navigationState";
import * as pregame from "./pregame";
import { Screen } from "./types/Screen";

export function init(): void {
  // Set up initial navigation state on page load.
  const currentState = getCurrentNavigationState();
  if (currentState === null) {
    // No state exists yet, so initialize it with the lobby screen.
    replaceNavigationState({ screen: Screen.Lobby });
  }

  // Listen for browser back/forward button clicks.
  globalThis.addEventListener("popstate", (event: PopStateEvent) => {
    const rawState = event.state;

    if (!isNavigationState(rawState)) {
      navigateToLobby();
      replaceNavigationState({ screen: Screen.Lobby });
      return;
    }

    // Route to the appropriate screen based on the state.
    switch (rawState.screen) {
      case Screen.Lobby: {
        navigateToLobby();
        break;
      }

      case Screen.History: {
        // Use internal show function that doesn't push new state.
        history.showWithoutPush();
        break;
      }

      case Screen.HistoryFriends: {
        history.showFriendsWithoutPush();
        break;
      }

      case Screen.HistoryOtherScores: {
        // This should navigate back to history when back is pressed.
        navigateToLobby();
        break;
      }

      case Screen.PreGame: {
        // PreGame navigation is handled by the server, so we should not handle it here. If the user
        // hits back from pregame, go to lobby.
        navigateToLobby();
        break;
      }

      default: {
        // For any other screen (Game, Login, etc.), go to lobby.
        navigateToLobby();
        break;
      }
    }
  });
}

function navigateToLobby() {
  // If we're in history or pregame, hide those screens.
  if (
    globals.currentScreen === Screen.History
    || globals.currentScreen === Screen.HistoryFriends
    || globals.currentScreen === Screen.HistoryOtherScores
  ) {
    history.hide();
  } else if (globals.currentScreen === Screen.PreGame) {
    pregame.hide();
  }
}

function isNavigationState(value: unknown): value is NavigationState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const potentialState = value as { screen?: unknown };
  return typeof potentialState.screen === "number";
}
