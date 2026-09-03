/**
 * One checklist per message, updating in place.
 *
 * The agent rewrites the whole todo list on every `todo_write` call, so
 * rendering each call would stack N copies of the same plan down the turn.
 * The first `todo_write` part keeps its position and takes the latest part's
 * content; the rest are dropped. Every other part passes through untouched
 * (recoupable/app#2052). `open-agents` solves the same problem with a pinned
 * panel outside the thread; inline collapse keeps this to the message.
 *
 * @param parts - A message's parts in order.
 * @returns The parts to render.
 */
export function collapseTodoParts<T extends { type: string }>(parts: T[]): T[] {
  const isTodo = (p: T) => p.type === "tool-todo_write";
  const first = parts.findIndex(isTodo);
  if (first === -1) return parts;
  const latest =
    parts[parts.length - 1 - [...parts].reverse().findIndex(isTodo)];
  return parts.flatMap((p, i) =>
    !isTodo(p) ? [p] : i === first ? [latest] : [],
  );
}
