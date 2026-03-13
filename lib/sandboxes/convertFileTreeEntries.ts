import type { FileNode } from "./parseFileTree";
import { sortFileTree } from "./sortFileTree";

export interface FileTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

/**
 *
 * @param entries
 */
export function convertFileTreeEntries(entries: FileTreeEntry[]): FileNode[] {
  const root: FileNode[] = [];
  const pathMap = new Map<string, FileNode>();

  for (const entry of entries) {
    const parts = entry.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (pathMap.has(currentPath)) continue;

      const isFolder = isLast ? entry.type === "tree" : true;
      const node: FileNode = {
        name: part,
        path: currentPath,
        type: isFolder ? "folder" : "file",
        ...(isFolder && { children: [] }),
      };

      pathMap.set(currentPath, node);

      if (parentPath) {
        const parent = pathMap.get(parentPath);
        if (parent?.children) {
          parent.children.push(node);
        }
      } else {
        root.push(node);
      }
    }
  }

  sortFileTree(root);
  return root;
}
