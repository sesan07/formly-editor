import { describe, expect, it } from 'vitest';
import { WorkspaceFolderNode, WorkspaceFormNode, WorkspaceHierarchy } from './types';
import {
  addNodeToHierarchy,
  buildHierarchyFromFlatForms,
  createEmptyWorkspaceHierarchy,
  getDescendantNodeIds,
  isAncestorOf,
  moveNodeInHierarchy,
  removeNodeFromHierarchy,
  renameNodeInHierarchy,
  toggleFolderExpansion,
} from './workspace-hierarchy.utils';

describe('workspace-hierarchy.utils', () => {
  const createTestHierarchy = (): WorkspaceHierarchy => {
    let hierarchy = createEmptyWorkspaceHierarchy('ws-1');

    const folder1: WorkspaceFolderNode = {
      id: 'folder-1',
      name: 'Marketing Site',
      type: 'folder',
      parentId: null,
      idPath: ['folder-1'],
      childIds: [],
    };

    const folder2: WorkspaceFolderNode = {
      id: 'folder-2',
      name: 'Internal Dashboard',
      type: 'folder',
      parentId: null,
      idPath: ['folder-2'],
      childIds: [],
    };

    const form1: WorkspaceFormNode = {
      id: 'form-1',
      name: 'ContactForm',
      type: 'form',
      libraryId: 'form-material',
      fieldCount: 3,
      parentId: null,
      idPath: ['form-1'],
    };

    hierarchy = addNodeToHierarchy(hierarchy, folder1);
    hierarchy = addNodeToHierarchy(hierarchy, folder2);
    hierarchy = addNodeToHierarchy(hierarchy, form1);

    return hierarchy;
  };

  it('creates an empty workspace hierarchy', () => {
    const hierarchy = createEmptyWorkspaceHierarchy('my-workspace');
    expect(hierarchy.workspaceId).toBe('my-workspace');
    expect(hierarchy.rootNodeIds).toEqual([]);
    expect(hierarchy.nodeMap).toEqual({});
  });

  describe('addNodeToHierarchy', () => {
    it('adds root folders and forms correctly', () => {
      const hierarchy = createTestHierarchy();
      expect(hierarchy.rootNodeIds).toEqual(['folder-1', 'folder-2', 'form-1']);
      expect(hierarchy.nodeMap['folder-1'].name).toBe('Marketing Site');
      expect(hierarchy.nodeMap['form-1'].name).toBe('ContactForm');
      expect(hierarchy.nodeMap['form-1'].idPath).toEqual(['form-1']);
    });

    it('adds a nested form inside a folder and computes idPath', () => {
      let hierarchy = createTestHierarchy();
      const nestedForm: WorkspaceFormNode = {
        id: 'nested-form-1',
        name: 'NewsletterSignup',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'folder-1',
        idPath: [],
      };

      hierarchy = addNodeToHierarchy(hierarchy, nestedForm);

      expect(hierarchy.rootNodeIds).not.toContain('nested-form-1');
      const parentFolder = hierarchy.nodeMap['folder-1'] as WorkspaceFolderNode;
      expect(parentFolder.childIds).toContain('nested-form-1');
      expect(hierarchy.nodeMap['nested-form-1'].idPath).toEqual(['folder-1', 'nested-form-1']);
    });

    it('adds nested subfolders recursively', () => {
      let hierarchy = createTestHierarchy();
      const subFolder: WorkspaceFolderNode = {
        id: 'subfolder-1',
        name: 'Landing Pages',
        type: 'folder',
        parentId: 'folder-1',
        idPath: [],
        childIds: [],
      };

      hierarchy = addNodeToHierarchy(hierarchy, subFolder);
      const deepForm: WorkspaceFormNode = {
        id: 'deep-form-1',
        name: 'Hero Form',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'subfolder-1',
        idPath: [],
      };

      hierarchy = addNodeToHierarchy(hierarchy, deepForm);

      expect(hierarchy.nodeMap['deep-form-1'].idPath).toEqual([
        'folder-1',
        'subfolder-1',
        'deep-form-1',
      ]);
    });

    it('throws when parent folder does not exist', () => {
      const hierarchy = createEmptyWorkspaceHierarchy('ws-1');
      const form: WorkspaceFormNode = {
        id: 'form-x',
        name: 'Form X',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'non-existent',
        idPath: [],
      };

      expect(() => addNodeToHierarchy(hierarchy, form)).toThrowError(
        "Parent folder with ID 'non-existent' does not exist.",
      );
    });
  });

  describe('isAncestorOf', () => {
    it('accurately identifies ancestors', () => {
      let hierarchy = createTestHierarchy();
      const subFolder: WorkspaceFolderNode = {
        id: 'sub-1',
        name: 'Sub',
        type: 'folder',
        parentId: 'folder-1',
        idPath: [],
        childIds: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, subFolder);

      const nestedForm: WorkspaceFormNode = {
        id: 'form-sub',
        name: 'Form Sub',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'sub-1',
        idPath: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, nestedForm);

      expect(isAncestorOf(hierarchy, 'folder-1', 'form-sub')).toBe(true);
      expect(isAncestorOf(hierarchy, 'sub-1', 'form-sub')).toBe(true);
      expect(isAncestorOf(hierarchy, 'folder-2', 'form-sub')).toBe(false);
      expect(isAncestorOf(hierarchy, 'form-sub', 'folder-1')).toBe(false);
    });
  });

  describe('getDescendantNodeIds', () => {
    it('returns all nested descendant IDs in subtree', () => {
      let hierarchy = createTestHierarchy();
      const sub1: WorkspaceFolderNode = {
        id: 'sub-1',
        name: 'Sub 1',
        type: 'folder',
        parentId: 'folder-1',
        idPath: [],
        childIds: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, sub1);

      const deepForm: WorkspaceFormNode = {
        id: 'deep-form',
        name: 'Deep Form',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'sub-1',
        idPath: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, deepForm);

      const descendants = getDescendantNodeIds(hierarchy, 'folder-1');
      expect(descendants).toEqual(['sub-1', 'deep-form']);
    });
  });

  describe('moveNodeInHierarchy', () => {
    it('moves a root form into a folder', () => {
      let hierarchy = createTestHierarchy();
      hierarchy = moveNodeInHierarchy(hierarchy, 'form-1', 'folder-1');

      expect(hierarchy.rootNodeIds).toEqual(['folder-1', 'folder-2']);
      const folder1 = hierarchy.nodeMap['folder-1'] as WorkspaceFolderNode;
      expect(folder1.childIds).toEqual(['form-1']);
      expect(hierarchy.nodeMap['form-1'].parentId).toBe('folder-1');
      expect(hierarchy.nodeMap['form-1'].idPath).toEqual(['folder-1', 'form-1']);
    });

    it('moves a form between folders', () => {
      let hierarchy = createTestHierarchy();
      hierarchy = moveNodeInHierarchy(hierarchy, 'form-1', 'folder-1');
      hierarchy = moveNodeInHierarchy(hierarchy, 'form-1', 'folder-2');

      const folder1 = hierarchy.nodeMap['folder-1'] as WorkspaceFolderNode;
      const folder2 = hierarchy.nodeMap['folder-2'] as WorkspaceFolderNode;

      expect(folder1.childIds).toEqual([]);
      expect(folder2.childIds).toEqual(['form-1']);
      expect(hierarchy.nodeMap['form-1'].parentId).toBe('folder-2');
      expect(hierarchy.nodeMap['form-1'].idPath).toEqual(['folder-2', 'form-1']);
    });

    it('moves a nested form back to root', () => {
      let hierarchy = createTestHierarchy();
      hierarchy = moveNodeInHierarchy(hierarchy, 'form-1', 'folder-1');
      hierarchy = moveNodeInHierarchy(hierarchy, 'form-1', null);

      expect(hierarchy.rootNodeIds).toEqual(['folder-1', 'folder-2', 'form-1']);
      expect(hierarchy.nodeMap['form-1'].parentId).toBeNull();
      expect(hierarchy.nodeMap['form-1'].idPath).toEqual(['form-1']);
    });

    it('prevents cycle when moving a folder into its own descendant', () => {
      let hierarchy = createTestHierarchy();
      const sub1: WorkspaceFolderNode = {
        id: 'sub-1',
        name: 'Sub 1',
        type: 'folder',
        parentId: 'folder-1',
        idPath: [],
        childIds: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, sub1);

      expect(() => moveNodeInHierarchy(hierarchy, 'folder-1', 'sub-1')).toThrowError(
        "Cannot move node 'folder-1' into its descendant 'sub-1' (cycle detected).",
      );
    });

    it('prevents moving a node into itself', () => {
      const hierarchy = createTestHierarchy();
      expect(() => moveNodeInHierarchy(hierarchy, 'folder-1', 'folder-1')).toThrowError(
        "Cannot move node 'folder-1' into itself.",
      );
    });
  });

  describe('removeNodeFromHierarchy', () => {
    it('removes a single root form', () => {
      const hierarchy = createTestHierarchy();
      const { hierarchy: nextHierarchy, removedNodeIds } = removeNodeFromHierarchy(
        hierarchy,
        'form-1',
      );

      expect(removedNodeIds).toEqual(['form-1']);
      expect(nextHierarchy.rootNodeIds).toEqual(['folder-1', 'folder-2']);
      expect(nextHierarchy.nodeMap['form-1']).toBeUndefined();
    });

    it('removes a folder and all recursive descendants', () => {
      let hierarchy = createTestHierarchy();
      const sub1: WorkspaceFolderNode = {
        id: 'sub-1',
        name: 'Sub 1',
        type: 'folder',
        parentId: 'folder-1',
        idPath: [],
        childIds: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, sub1);

      const deepForm: WorkspaceFormNode = {
        id: 'deep-form',
        name: 'Deep Form',
        type: 'form',
        libraryId: 'form-material',
        parentId: 'sub-1',
        idPath: [],
      };
      hierarchy = addNodeToHierarchy(hierarchy, deepForm);

      const { hierarchy: nextHierarchy, removedNodeIds } = removeNodeFromHierarchy(
        hierarchy,
        'folder-1',
      );

      expect(removedNodeIds).toEqual(['folder-1', 'sub-1', 'deep-form']);
      expect(nextHierarchy.rootNodeIds).toEqual(['folder-2', 'form-1']);
      expect(nextHierarchy.nodeMap['folder-1']).toBeUndefined();
      expect(nextHierarchy.nodeMap['sub-1']).toBeUndefined();
      expect(nextHierarchy.nodeMap['deep-form']).toBeUndefined();
    });
  });

  describe('renameNodeInHierarchy', () => {
    it('renames a node', () => {
      const hierarchy = createTestHierarchy();
      const nextHierarchy = renameNodeInHierarchy(hierarchy, 'form-1', 'New Contact Form');

      expect(nextHierarchy.nodeMap['form-1'].name).toBe('New Contact Form');
      expect(nextHierarchy.nodeMap['form-1'].updatedAt).toBeDefined();
    });
  });

  describe('toggleFolderExpansion', () => {
    it('toggles folder expansion state', () => {
      const hierarchy = createTestHierarchy();
      let nextHierarchy = toggleFolderExpansion(hierarchy, 'folder-1');
      expect((nextHierarchy.nodeMap['folder-1'] as WorkspaceFolderNode).isExpanded).toBe(true);

      nextHierarchy = toggleFolderExpansion(nextHierarchy, 'folder-1');
      expect((nextHierarchy.nodeMap['folder-1'] as WorkspaceFolderNode).isExpanded).toBe(false);

      nextHierarchy = toggleFolderExpansion(nextHierarchy, 'folder-1', true);
      expect((nextHierarchy.nodeMap['folder-1'] as WorkspaceFolderNode).isExpanded).toBe(true);
    });
  });

  describe('buildHierarchyFromFlatForms', () => {
    it('converts legacy flat forms array into valid hierarchy', () => {
      const legacyForms = [
        {
          id: 'form-a',
          name: 'Form A',
          libraryId: 'form-material',
          fieldCount: 2,
        },
        {
          id: 'form-b',
          name: 'Form B',
          libraryId: 'form-material',
          fieldCount: 5,
          parentId: 'f-1',
        },
      ];

      const hierarchy = buildHierarchyFromFlatForms('test-ws', legacyForms);
      expect(hierarchy.workspaceId).toBe('test-ws');
      expect(hierarchy.rootNodeIds).toEqual(['form-a']);
      expect(hierarchy.nodeMap['form-a'].type).toBe('form');
      expect(hierarchy.nodeMap['form-a'].idPath).toEqual(['form-a']);
      expect(hierarchy.nodeMap['form-b'].parentId).toBe('f-1');
      expect(hierarchy.nodeMap['form-b'].idPath).toEqual(['f-1', 'form-b']);
    });
  });
});
