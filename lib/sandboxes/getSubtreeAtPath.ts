import type { FileNode } from "./parseFileTree";

const WORKSPACE_ORGS_PATH = ".openclaw/workspace/orgs";

/**
 *
 * @param nodes
 */
export default function getSubtreeAtPath(nodes: FileNode[]): FileNode[] {
  const segments = WORKSPACE_ORGS_PATH.split("/");
  let current = nodes;

  for (const segment of segments) {
    const found = current.find(node => node.name === segment && node.type === "folder");
    if (!found?.children) return nodes;
    current = found.children;
  }

  return current;
}
