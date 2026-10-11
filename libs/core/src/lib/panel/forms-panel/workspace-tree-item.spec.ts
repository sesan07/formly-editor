import { CoreFormService } from '../../editor/core-form.service';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreLibraryService } from '../../config/core-library.service';
import { CreateFormDialogService } from './create-form-dialog.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import {
  WorkspaceFolderNode,
  WorkspaceFormNode,
  WorkspaceHierarchy,
  WorkspaceNode,
} from '../../model/types';
import { createEmptyWorkspaceHierarchy } from '../../model/workspace-hierarchy.utils';
import { WorkspaceTreeItem } from './workspace-tree-item';

describe('WorkspaceTreeItem', () => {
  let fixture: ComponentFixture<WorkspaceTreeItem>;
  let setActiveForm: ReturnType<typeof vi.fn>;
  let toggleFolderExpansion: ReturnType<typeof vi.fn>;
  let deleteWorkspaceNode: ReturnType<typeof vi.fn>;
  let createFolder: ReturnType<typeof vi.fn>;
  let openCreateFormDialog: ReturnType<typeof vi.fn>;

  const activeFormId = signal<string | null>(null);
  const activeForm = signal<{ libraryId?: string } | null>(null);
  const hierarchy = signal<WorkspaceHierarchy>(createEmptyWorkspaceHierarchy('test-ws'));

  beforeEach(async () => {
    setActiveForm = vi.fn();
    toggleFolderExpansion = vi.fn();
    deleteWorkspaceNode = vi.fn();
    createFolder = vi.fn();
    openCreateFormDialog = vi.fn();
    activeFormId.set(null);
    activeForm.set({ libraryId: 'form-material' });

    const folderWithChildren: WorkspaceFolderNode = {
      id: 'folder-1',
      name: 'Marketing Folder',
      type: 'folder',
      parentId: null,
      idPath: ['folder-1'],
      childIds: ['form-child'],
      isExpanded: true,
    };

    const emptyFolder: WorkspaceFolderNode = {
      id: 'folder-empty',
      name: 'Empty Folder',
      type: 'folder',
      parentId: null,
      idPath: ['folder-empty'],
      childIds: [],
      isExpanded: true,
    };

    const formChild: WorkspaceFormNode = {
      id: 'form-child',
      name: 'Child Form',
      type: 'form',
      libraryId: 'form-material',
      fieldCount: 2,
      parentId: 'folder-1',
      idPath: ['folder-1', 'form-child'],
    };

    const nodeMap: Record<string, WorkspaceNode> = {
      'folder-1': folderWithChildren,
      'folder-empty': emptyFolder,
      'form-child': formChild,
    };

    hierarchy.set({
      workspaceId: 'test-ws',
      rootNodeIds: ['folder-1', 'folder-empty'],
      nodeMap,
    });

    TestBed.resetTestingModule();
    TestBed.overrideComponent(WorkspaceTreeItem, {
      set: {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {
            provide: CreateFormDialogService,
            useValue: {
              open: openCreateFormDialog,
              close: vi.fn(),
              isOpen: signal(false),
              parentId: signal(null),
            },
          },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [WorkspaceTreeItem],
      providers: [
        MouseInsideService,
        {
          provide: CoreFormService,
          useValue: {
            activeFormId,
            activeForm,
            hierarchyNodeMap: () => hierarchy().nodeMap,
            setActiveForm,
            toggleFolderExpansion,
            deleteWorkspaceNode,
            createFolder,
          },
        },
        {
          provide: CoreLibraryService,
          useValue: {
            getLibraryLabel: (id: string) => (id === 'form-material' ? 'Material' : id),
          },
        },
      ],
    }).compileComponents();
  });

  describe('folder node', () => {
    it('renders folder item and toggles expansion on click', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Marketing Folder');

      const treeItem = fixture.nativeElement.querySelector('core-tree-item');
      treeItem?.click();

      expect(toggleFolderExpansion).toHaveBeenCalledWith('folder-1');
    });

    it('adds nested folder inside folder via folder menu', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.detectChanges();

      const addFolderItem = fixture.componentInstance.folderMenuItems.find(
        (item) => item.label === 'Add Folder',
      );
      expect(addFolderItem).toBeTruthy();

      addFolderItem?.command?.({});
      expect(createFolder).toHaveBeenCalledWith('New Folder', 'folder-1');
    });

    it('opens create-form dialog with folder as parent via folder menu', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.detectChanges();

      const addFormItem = fixture.componentInstance.folderMenuItems.find(
        (item) => item.label === 'Add Form',
      );
      expect(addFormItem).toBeTruthy();

      addFormItem?.command?.({});
      expect(openCreateFormDialog).toHaveBeenCalledWith('folder-1');
    });

    it('deletes folder via folder menu', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.detectChanges();

      const deleteItem = fixture.componentInstance.folderMenuItems.find(
        (item) => item.label === 'Delete',
      );
      expect(deleteItem).toBeTruthy();

      deleteItem?.command?.({});
      expect(deleteWorkspaceNode).toHaveBeenCalledWith('folder-1');
    });

    it('renders nested child items when expanded and has children', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.detectChanges();

      const childItems = fixture.nativeElement.querySelectorAll('core-workspace-tree-item');
      expect(childItems.length).toBe(1);
    });

    it('hides unmatched child nodes while filtering', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.componentRef.setInput('isFiltering', true);
      fixture.componentRef.setInput('filteredVisibleNodeIds', ['folder-1']);
      fixture.detectChanges();

      const childLi = fixture.nativeElement.querySelector('ul li');
      expect(childLi?.classList.contains('hidden')).toBe(true);
    });

    it('keeps matched child nodes visible while filtering', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-1');
      fixture.componentRef.setInput('isFiltering', true);
      fixture.componentRef.setInput('filteredVisibleNodeIds', ['folder-1', 'form-child']);
      fixture.detectChanges();

      const childLi = fixture.nativeElement.querySelector('ul li');
      expect(childLi?.classList.contains('hidden')).toBe(false);
    });

    it('renders "No forms yet" when expanded with no children', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'folder-empty');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No forms yet');
    });
  });

  describe('form node', () => {
    it('renders form item, field count, and UI config label', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'form-child');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Child Form');
      expect(fixture.nativeElement.textContent).toContain('2 Fields');
      expect(fixture.nativeElement.textContent).toContain('Material');
    });

    it('selects form when clicked', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'form-child');
      fixture.detectChanges();

      const treeItem = fixture.nativeElement.querySelector('core-tree-item');
      treeItem?.click();

      expect(setActiveForm).toHaveBeenCalledWith('form-child');
    });

    it('deletes form via form menu', () => {
      fixture = TestBed.createComponent(WorkspaceTreeItem);
      fixture.componentRef.setInput('nodeId', 'form-child');
      fixture.detectChanges();

      const deleteItem = fixture.componentInstance.formMenuItems.find(
        (item) => item.label === 'Delete',
      );
      expect(deleteItem).toBeTruthy();

      deleteItem?.command?.({});
      expect(deleteWorkspaceNode).toHaveBeenCalledWith('form-child');
    });
  });
});
