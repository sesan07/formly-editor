import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TieredMenu } from 'primeng/tieredmenu';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFieldService } from '../config/core-field.service';
import { CoreFormService } from '../editor/core-form.service';
import { CoreAddFieldOption } from '../editor/types';
import { FieldPresetDialogService } from '../field-preset/field-preset-dialog.service';
import { EditorField, FieldInfo } from '../model/types';
import { FormlyFieldHeader } from './formly-field-header';

const fieldInfo: FieldInfo = {
  childIds: [],
  id: 'field-1',
  name: 'Text Field',
  formId: 'form-1',
  idPath: ['field-1'],
  isRoot: true,
};

const field: EditorField = {
  type: 'input',
  _info: fieldInfo,
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyFieldHeader],
  template: `
    <core-formly-field-header
      fieldKey="name"
      [field]="field"
      [fieldInfo]="fieldInfo"
      [isMouseInside]="isMouseInside()"
    />
  `,
})
class TestHostComponent {
  readonly field = field;
  readonly fieldInfo = fieldInfo;
  readonly isMouseInside = signal(false);
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('FormlyFieldHeader', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let header: FormlyFieldHeader;
  let tieredMenu: TieredMenu;
  let addField: (fieldType: string, fieldId: string) => void;
  let addOptions: CoreAddFieldOption[];

  beforeEach(async () => {
    addField = vi.fn<(fieldType: string, fieldId: string) => void>();
    addOptions = [
      {
        label: 'Text',
        items: [
          {
            label: 'Basic',
            items: [
              {
                label: 'Input',
                command: () => addField('input', fieldInfo.id),
              },
            ],
          },
        ],
      },
    ];

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        FieldPresetDialogService,
        {
          provide: CoreFormService,
          useValue: {
            getAddOptions: () => addOptions,
            getReplaceOptions: () => [],
            getFieldIndex: () => -1,
            activeRootFieldIds: () => [],
          },
        },
        {
          provide: CoreFieldService,
          useValue: {
            getFieldIcon: () => 'text_fields',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    header = fixture.debugElement.query(By.directive(FormlyFieldHeader)).componentInstance;
    tieredMenu = fixture.debugElement.query(By.directive(TieredMenu)).componentInstance;
  });

  it('renders add options through a tiered menu', () => {
    expect(tieredMenu.model).toEqual(addOptions);
    expect(header.addOptions()).toEqual(addOptions);
    expect(addOptions[0].items?.[0].items?.[0].label).toBe('Input');
  });

  it('opens the tiered add menu and prevents the button default action', () => {
    const event = new MouseEvent('click');
    const show = vi.spyOn(tieredMenu, 'show').mockImplementation(() => undefined);
    const preventDefault = vi.spyOn(event, 'preventDefault');

    header.openAddMenu(event);

    expect(show).toHaveBeenCalledWith(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('keeps leaf add commands intact', () => {
    const command = addOptions[0].items?.[0].items?.[0].command;

    command?.({});

    expect(addField).toHaveBeenCalledWith('input', fieldInfo.id);
  });

  it('keeps the header actions visible while the add menu is open', () => {
    tieredMenu.visible = true;
    fixture.componentInstance.isMouseInside.set(true);
    fixture.detectChanges();
    fixture.componentInstance.isMouseInside.set(false);

    expect(header.areOptionsVisible()).toBe(true);
  });
});
