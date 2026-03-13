import type { FileNode } from "./parseFileTree";

/**
 *
 * @param nodes
 */
export function sortFileTree(nodes: FileNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  for (const node of nodes) {
    if (node.children) {
      sortFileTree(node.children);
    }
  }
}
