import {
  BaseEditorForm,
  WorkspaceFolderNode,
  WorkspaceFormNode,
  WorkspaceHierarchy,
  WorkspaceNode,
} from './types';

/**
 * Creates a clean, empty workspace hierarchy structure.
 */
export function createEmptyWorkspaceHierarchy(workspaceId: string): WorkspaceHierarchy {
  return {
    workspaceId,
    rootNodeIds: [],
    nodeMap: {},
  };
}

/**
 * Checks if a candidate node is an ancestor of target node.
 * Used to prevent circular hierarchies (e.g. moving a folder into its own subfolder).
 */
export function isAncestorOf(
  hierarchy: WorkspaceHierarchy,
  potentialAncestorId: string,
  targetNodeId: string | null,
): boolean {
  if (!targetNodeId || !potentialAncestorId) {
    return false;
  }
  if (potentialAncestorId === targetNodeId) {
    return true;
  }

  const targetNode = hierarchy.nodeMap[targetNodeId];
  if (!targetNode) {
    return false;
  }

  return targetNode.idPath.includes(potentialAncestorId);
}

/**
 * Recursively collects all descendant node IDs for a given folder.
 */
export function getDescendantNodeIds(hierarchy: WorkspaceHierarchy, folderId: string): string[] {
  const folder = hierarchy.nodeMap[folderId];
  if (!folder || folder.type !== 'folder') {
    return [];
  }

  const result: string[] = [];
  const traverse = (currentFolder: WorkspaceFolderNode) => {
    for (const childId of currentFolder.childIds) {
      result.push(childId);
      const child = hierarchy.nodeMap[childId];
      if (child && child.type === 'folder') {
        traverse(child);
      }
    }
  };

  traverse(folder);
  return result;
}

/**
 * Recalculates idPaths for a node and all its descendants recursively.
 */
export function recalculateNodePaths(
  nodeMap: Record<string, WorkspaceNode>,
  nodeId: string,
  parentPath: string[] = [],
): Record<string, WorkspaceNode> {
  const node = nodeMap[nodeId];
  if (!node) {
    return nodeMap;
  }

  const updatedPath = [...parentPath, nodeId];
  const updatedNode = {
    ...node,
    idPath: updatedPath,
  };

  let updatedMap = {
    ...nodeMap,
    [nodeId]: updatedNode,
  };

  if (updatedNode.type === 'folder') {
    for (const childId of updatedNode.childIds) {
      updatedMap = recalculateNodePaths(updatedMap, childId, updatedPath);
    }
  }

  return updatedMap;
}

/**
 * Adds a new node (folder or form) to the hierarchy immutably.
 */
export function addNodeToHierarchy(
  hierarchy: WorkspaceHierarchy,
  node: WorkspaceNode,
  targetIndex?: number,
): WorkspaceHierarchy {
  const { parentId } = node;
  const parent = parentId ? hierarchy.nodeMap[parentId] : null;

  if (parentId && (!parent || parent.type !== 'folder')) {
    throw new Error(`Parent folder with ID '${parentId}' does not exist.`);
  }

  const parentPath = parent ? parent.idPath : [];
  const nodeWithPath: WorkspaceNode = {
    ...node,
    idPath: [...parentPath, node.id],
  };

  let updatedNodeMap = {
    ...hierarchy.nodeMap,
    [node.id]: nodeWithPath,
  };

  const updatedRootNodeIds = [...hierarchy.rootNodeIds];

  if (!parentId) {
    if (!updatedRootNodeIds.includes(node.id)) {
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        updatedRootNodeIds.splice(targetIndex, 0, node.id);
      } else {
        updatedRootNodeIds.push(node.id);
      }
    }
  } else if (parent && parent.type === 'folder') {
    const updatedChildIds = [...parent.childIds];
    if (!updatedChildIds.includes(node.id)) {
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        updatedChildIds.splice(targetIndex, 0, node.id);
      } else {
        updatedChildIds.push(node.id);
      }
    }

    updatedNodeMap[parentId] = {
      ...parent,
      childIds: updatedChildIds,
      isExpanded: true,
    };
  }

  // Recalculate paths if the added node itself had children
  if (node.type === 'folder' && node.childIds.length > 0) {
    updatedNodeMap = recalculateNodePaths(updatedNodeMap, node.id, parentPath);
  }

  return {
    ...hierarchy,
    rootNodeIds: updatedRootNodeIds,
    nodeMap: updatedNodeMap,
  };
}

/**
 * Removes a node and all of its descendants recursively from the hierarchy.
 */
export function removeNodeFromHierarchy(
  hierarchy: WorkspaceHierarchy,
  nodeId: string,
): { hierarchy: WorkspaceHierarchy; removedNodeIds: string[] } {
  const node = hierarchy.nodeMap[nodeId];
  if (!node) {
    return { hierarchy, removedNodeIds: [] };
  }

  const descendantIds = node.type === 'folder' ? getDescendantNodeIds(hierarchy, nodeId) : [];
  const allIdsToRemove = [nodeId, ...descendantIds];

  const updatedNodeMap = { ...hierarchy.nodeMap };
  for (const id of allIdsToRemove) {
    delete updatedNodeMap[id];
  }

  let updatedRootNodeIds = [...hierarchy.rootNodeIds];
  if (!node.parentId) {
    updatedRootNodeIds = updatedRootNodeIds.filter((id) => id !== nodeId);
  } else {
    const parent = updatedNodeMap[node.parentId];
    if (parent && parent.type === 'folder') {
      updatedNodeMap[node.parentId] = {
        ...parent,
        childIds: parent.childIds.filter((id) => id !== nodeId),
      };
    }
  }

  return {
    hierarchy: {
      ...hierarchy,
      rootNodeIds: updatedRootNodeIds,
      nodeMap: updatedNodeMap,
    },
    removedNodeIds: allIdsToRemove,
  };
}

/**
 * Moves a node to a new parent folder (or to root) with cycle detection.
 */
export function moveNodeInHierarchy(
  hierarchy: WorkspaceHierarchy,
  nodeId: string,
  newParentId: string | null,
  targetIndex?: number,
): WorkspaceHierarchy {
  const node = hierarchy.nodeMap[nodeId];
  if (!node) {
    throw new Error(`Node with ID '${nodeId}' not found.`);
  }

  if (newParentId === nodeId) {
    throw new Error(`Cannot move node '${nodeId}' into itself.`);
  }

  if (newParentId && isAncestorOf(hierarchy, nodeId, newParentId)) {
    throw new Error(
      `Cannot move node '${nodeId}' into its descendant '${newParentId}' (cycle detected).`,
    );
  }

  const oldParentId = node.parentId;
  let updatedNodeMap = { ...hierarchy.nodeMap };
  let updatedRootNodeIds = [...hierarchy.rootNodeIds];

  // 1. Remove from old location
  if (!oldParentId) {
    updatedRootNodeIds = updatedRootNodeIds.filter((id) => id !== nodeId);
  } else {
    const oldParent = updatedNodeMap[oldParentId];
    if (oldParent && oldParent.type === 'folder') {
      updatedNodeMap[oldParentId] = {
        ...oldParent,
        childIds: oldParent.childIds.filter((id) => id !== nodeId),
      };
    }
  }

  // 2. Add to new location
  const newParent = newParentId ? updatedNodeMap[newParentId] : null;
  if (newParentId && (!newParent || newParent.type !== 'folder')) {
    throw new Error(`Target parent folder with ID '${newParentId}' does not exist.`);
  }

  const parentPath = newParent ? newParent.idPath : [];

  if (!newParentId) {
    if (typeof targetIndex === 'number' && targetIndex >= 0) {
      updatedRootNodeIds.splice(targetIndex, 0, nodeId);
    } else {
      updatedRootNodeIds.push(nodeId);
    }
  } else if (newParent && newParent.type === 'folder') {
    const updatedChildIds = [...newParent.childIds];
    if (typeof targetIndex === 'number' && targetIndex >= 0) {
      updatedChildIds.splice(targetIndex, 0, nodeId);
    } else {
      updatedChildIds.push(nodeId);
    }

    updatedNodeMap[newParentId] = {
      ...newParent,
      childIds: updatedChildIds,
    };
  }

  // 3. Update moved node's parentId and recalculate paths
  updatedNodeMap[nodeId] = {
    ...node,
    parentId: newParentId,
    idPath: [...parentPath, nodeId],
  };

  updatedNodeMap = recalculateNodePaths(updatedNodeMap, nodeId, parentPath);

  return {
    ...hierarchy,
    rootNodeIds: updatedRootNodeIds,
    nodeMap: updatedNodeMap,
  };
}

/**
 * Renames a node in the hierarchy immutably.
 */
export function renameNodeInHierarchy(
  hierarchy: WorkspaceHierarchy,
  nodeId: string,
  newName: string,
): WorkspaceHierarchy {
  const node = hierarchy.nodeMap[nodeId];
  if (!node) {
    return hierarchy;
  }

  return {
    ...hierarchy,
    nodeMap: {
      ...hierarchy.nodeMap,
      [nodeId]: {
        ...node,
        name: newName,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

/**
 * Toggles or sets the expanded state of a folder.
 */
export function toggleFolderExpansion(
  hierarchy: WorkspaceHierarchy,
  folderId: string,
  isExpanded?: boolean,
): WorkspaceHierarchy {
  const folder = hierarchy.nodeMap[folderId];
  if (!folder || folder.type !== 'folder') {
    return hierarchy;
  }

  const nextExpandedState = isExpanded !== undefined ? isExpanded : !folder.isExpanded;

  return {
    ...hierarchy,
    nodeMap: {
      ...hierarchy.nodeMap,
      [folderId]: {
        ...folder,
        isExpanded: nextExpandedState,
      },
    },
  };
}

/**
 * Migrates a legacy flat array of forms into a normalized WorkspaceHierarchy.
 */
export function buildHierarchyFromFlatForms(
  workspaceId: string,
  forms: BaseEditorForm[],
): WorkspaceHierarchy {
  const nodeMap: Record<string, WorkspaceNode> = {};
  const rootNodeIds: string[] = [];

  for (const form of forms) {
    const parentId = form.parentId || null;
    const formNode: WorkspaceFormNode = {
      id: form.id,
      name: form.name,
      type: 'form',
      libraryId: form.libraryId,
      fieldCount: form.fieldCount,
      parentId: parentId,
      idPath: parentId ? [parentId, form.id] : [form.id],
    };

    nodeMap[form.id] = formNode;
    if (!parentId) {
      rootNodeIds.push(form.id);
    }
  }

  return {
    workspaceId,
    rootNodeIds,
    nodeMap,
  };
}
