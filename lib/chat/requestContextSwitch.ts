/** Let the mounted composer protect unsent work before changing context. */
export function requestContextSwitch(action: () => void) {
  const event = new CustomEvent("recoup:context-switch", {
    cancelable: true,
    detail: action,
  });
  if (window.dispatchEvent(event)) action();
}
