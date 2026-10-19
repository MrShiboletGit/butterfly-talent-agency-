/**
 * Whether the open profile dialog was opened by a click during this page load.
 *
 * The dialog's background page lives in history.state, so a refresh restores the
 * dialog too. But the entry before it then belongs to the old page load, and
 * going Back to it reloads the whole site. Such a dialog closes in place instead.
 */
let openedHere = false;

export const markProfileOpenedHere = () => {
  openedHere = true;
};

export const profileOpenedHere = () => openedHere;
