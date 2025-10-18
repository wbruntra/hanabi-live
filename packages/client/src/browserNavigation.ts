// Handles browser back/forward button navigation.
import { globals } from "./Globals";
import * as lobbyHistory from "./lobby/history";
import * as lobbyPregame from "./lobby/pregame";
import { Screen } from "./lobby/types/Screen";

export function init(): void {
  // Handle browser back/forward buttons.
  globalThis.addEventListener("popstate", handlePopState);

  // Initialize history state with current path if not already set.
  if (globalThis.history.state === null) {
    globalThis.history.replaceState(
      { path: globalThis.location.pathname },
      "",
      globalThis.location.href,
    );
  }
}

function handlePopState() {
  const currentPath = globalThis.location.pathname;

  // Check if we're in a pregame and the back button was pressed.
  if (globals.currentScreen === Screen.PreGame &&
      !currentPath.startsWith("/pre-game/")) {
    // Navigate back to lobby.
    lobbyPregame.hide();
    // Unattend the table when navigating back.
    if (globals.tableID !== -1) {
      globals.conn!.send("tableUnattend", {
        tableID: globals.tableID,
      });
      globals.tableID = -1;
    }
    return;
  }

  // Check if we're in the history screen and the back button was pressed.
  if (
    (globals.currentScreen === Screen.History ||
      globals.currentScreen === Screen.HistoryFriends ||
      globals.currentScreen === Screen.HistoryOtherScores) &&
    !currentPath.startsWith("/history")
  ) {
    // Navigate back to lobby.
    lobbyHistory.hide();
    return;
  }

  // If we're in the lobby and back button was pressed to go to pregame/history.
  if (globals.currentScreen === Screen.Lobby) {
    const preGameMatch = /\/pre-game\/(\d+)/.exec(currentPath);
    if (preGameMatch !== null) {
      /**
       * User navigated forward to a pregame URL. We should not automatically rejoin since this
       * could be an old pregame. Just stay on lobby.
       */
      return;
    }

    if (currentPath.startsWith("/history")) {
      // User navigated forward to history.
      lobbyHistory.show();
    }
  }
}
