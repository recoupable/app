import type { FileNode } from "@/lib/sandboxes/parseFileTree";

/**
 * Finds a node in the file tree by path.
 */
export function findFileNode(
  nodes: FileNode[],
  path: string,
): FileNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileNode(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}
