import type { FileNode } from "./parseFileTree";
import { WORKSPACE_ORGS_PATH } from "./workspaceOrgsPath";

export default function getSubtreeAtPath(nodes: FileNode[]): FileNode[] {
  const segments = WORKSPACE_ORGS_PATH.split("/");
  let current = nodes;

  for (const segment of segments) {
    const found = current.find(
      (node) => node.name === segment && node.type === "folder",
    );
    if (!found?.children) return nodes;
    current = found.children;
  }

  return current;
}
