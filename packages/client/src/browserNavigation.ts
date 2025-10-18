// Handles browser back/forward button navigation.
import { globals } from "./Globals";
import * as lobbyHistory from "./lobby/history";
import * as lobbyPregame from "./lobby/pregame";
import { Screen } from "./lobby/types/Screen";

const LOBBY_PATH = "/lobby";
const PREGAME_PATH_PREFIX = "/pre-game/";
const HISTORY_PATH_PREFIX = "/history";

/** Check if a path is a non-lobby page that should have a lobby state in history. */
function isNonLobbyPage(path: string): boolean {
  return path.startsWith(PREGAME_PATH_PREFIX) || path.startsWith(HISTORY_PATH_PREFIX);
}

export function init(): void {
  // Handle browser back/forward buttons.
  globalThis.addEventListener("popstate", handlePopState);

  /**
   * Initialize history state with current path if not already set. If we're starting on a non-lobby
   * page (like /pre-game/123 or /history), ensure there's a lobby state in history so the back
   * button can return to it.
   */
  const currentPath = globalThis.location.pathname;
  if (globalThis.history.state === null) {
    if (isNonLobbyPage(currentPath)) {
      // We're starting on a non-lobby page, so push a lobby state first.
      globalThis.history.replaceState(
        { path: LOBBY_PATH },
        "",
        `${LOBBY_PATH}${globalThis.location.search}`,
      );
      // Then push the current page state.
      globalThis.history.pushState(
        { path: currentPath },
        "",
        globalThis.location.href,
      );
    } else {
      // We're starting on the lobby or another page, just set the current state.
      globalThis.history.replaceState(
        { path: currentPath },
        "",
        globalThis.location.href,
      );
    }
  }
}

function handlePopState() {
  const currentPath = globalThis.location.pathname;

  // Check if we're in a pregame and the back button was pressed.
  if (globals.currentScreen === Screen.PreGame &&
      !currentPath.startsWith(PREGAME_PATH_PREFIX)) {
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
    !currentPath.startsWith(HISTORY_PATH_PREFIX)
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

    if (currentPath.startsWith(HISTORY_PATH_PREFIX)) {
      // User navigated forward to history.
      lobbyHistory.show();
    }
  }
}
