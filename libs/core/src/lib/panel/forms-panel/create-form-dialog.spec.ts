import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { CreateFormDialogService } from './create-form-dialog.service';
import { CreateFormDialog } from './create-form-dialog';

function getForm(component: CreateFormDialog): NgForm {
  return (component as unknown as { form: () => NgForm }).form();
}

describe('CreateFormDialog', () => {
  let fixture: ComponentFixture<CreateFormDialog>;
  let addForm$: ReturnType<typeof vi.fn>;
  let isOpen: ReturnType<typeof signal<boolean>>;
  let parentId: ReturnType<typeof signal<string | null>>;

  const templateA = {
    name: 'Material Showcase',
    libraryId: 'form-material',
    icon: 'contact_mail',
    description: 'Standard inquiry form.',
    fields: [{ key: 'name', type: 'input' }],
    model: { name: 'Jane' },
  };

  const templateB = {
    name: 'Material Draft',
    libraryId: 'form-material',
    icon: 'person_add',
    fields: [{ key: 'email', type: 'input' }],
    model: {},
  };

  const templateZorro = {
    name: 'Ng Zorro Showcase',
    libraryId: 'form-ng-zorro',
    icon: 'dashboard',
    description: 'Ng Zorro controls.',
    fields: [{ key: 'name', type: 'input' }],
    model: { name: 'Jane' },
  };

  function openDialog(): void {
    isOpen.set(true);
    fixture.detectChanges();
  }

  function setName(name: string): void {
    const nameInput = fixture.nativeElement.querySelector('#create-form-name') as HTMLInputElement;
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
    nameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function selectTemplate(templateId: string): void {
    const radio = fixture.nativeElement.querySelector(
      `p-radiobutton[inputid="template-${templateId}"] input`,
    ) as HTMLInputElement | null;

    if (radio) {
      radio.click();
    } else {
      // Fallback: find by label id and click the associated radio input
      const label = fixture.nativeElement.querySelector(`label[for="template-${templateId}"]`);
      const fallbackRadio = label?.querySelector('input') as HTMLInputElement | undefined;
      fallbackRadio?.click();
    }

    fixture.detectChanges();
  }

  beforeEach(async () => {
    addForm$ = vi.fn(() => of(undefined));
    isOpen = signal(false);
    parentId = signal(null);

    TestBed.resetTestingModule();
    TestBed.overrideComponent(CreateFormDialog, {
      set: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    await TestBed.configureTestingModule({
      imports: [CreateFormDialog],
      providers: [
        provideNoopAnimations(),
        {
          provide: CoreFormService,
          useValue: {
            addForm$,
          },
        },
        {
          provide: CoreLibraryService,
          useValue: {
            libraryOptions: [
              { id: 'form-material', label: 'Material' },
              { id: 'form-ng-zorro', label: 'Ng Zorro' },
            ],
            formTemplates: [templateA, templateB, templateZorro],
            getLibraryLabel: (libraryId: string) =>
              libraryId === 'form-ng-zorro' ? 'Ng Zorro' : 'Material',
          },
        },
        {
          provide: CreateFormDialogService,
          useValue: {
            open: vi.fn(),
            close: vi.fn(),
            isOpen,
            parentId,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFormDialog);
    fixture.detectChanges();
  });

  it('resets to blank template and default name when opened', () => {
    openDialog();
    setName('Custom');
    selectTemplate('Material Showcase');
    fixture.detectChanges();

    // Close and reopen
    isOpen.set(false);
    fixture.detectChanges();
    openDialog();

    const nameInput = fixture.nativeElement.querySelector('#create-form-name') as HTMLInputElement;
    expect(nameInput.value).toBe('New Form');
    expect(getForm(fixture.componentInstance).value.template).toBe('blank');
  });

  it('lists blank option plus configured templates', () => {
    openDialog();
    const templates = fixture.componentInstance.templates;
    expect(templates.length).toBe(4);
    expect(templates[0].id).toBe('blank');
    expect(templates[1].id).toBe('Material Showcase-form-material');
    expect(templates[2].id).toBe('Material Draft-form-material');
    expect(templates[3].id).toBe('Ng Zorro Showcase-form-ng-zorro');
  });

  it('selects a template and keeps default name until edited', () => {
    openDialog();
    selectTemplate('Material Showcase-form-material');
    fixture.detectChanges();

    expect(getForm(fixture.componentInstance).value.template).toBe(
      'Material Showcase-form-material',
    );
  });

  it('creates a blank form with editor config id and current parent', () => {
    parentId.set('folder-1');
    openDialog();
    setName('Blankie');
    fixture.componentInstance.createForm();

    expect(addForm$).toHaveBeenCalledWith('Blankie', [], {}, 'form-material', true, 'folder-1');
  });

  it('creates a blank form with the selected Ng Zorro library', () => {
    openDialog();
    fixture.componentInstance.selectedLibrary.set('form-ng-zorro');
    setName('Zorro Blankie');
    fixture.componentInstance.createForm();

    expect(addForm$).toHaveBeenCalledWith('Zorro Blankie', [], {}, 'form-ng-zorro', true, null);
  });

  it('creates a form from selected template using template metadata', () => {
    parentId.set(null);
    openDialog();
    setName('Support');
    selectTemplate('Material Showcase-form-material');
    fixture.componentInstance.createForm();

    expect(addForm$).toHaveBeenCalledWith(
      'Support',
      templateA.fields,
      templateA.model,
      templateA.libraryId,
      true,
      null,
    );
  });
});
