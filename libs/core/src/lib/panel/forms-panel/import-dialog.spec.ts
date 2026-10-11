import { CoreFormService } from '../../editor/core-form.service';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoreLibraryService } from '../../config/core-library.service';
import { ImportDialog } from './import-dialog';

describe('ImportDialog', () => {
  afterEach(() => TestBed.resetTestingModule());

  function setup(addForm$ = vi.fn(() => of(undefined))) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CoreLibraryService,
          useValue: {
            libraryOptions: [{ id: 'form-material', label: 'Material' }],
            getLibrary: () => null,
          },
        },
        {
          provide: CoreFormService,
          useValue: {
            addForm$,
            activeFormId: () => 'imported-form',
            isArrayRoot: false,
          },
        },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new ImportDialog());
    return { addForm$, component };
  }

  it.each(['{', '{}'] as const)('ignores invalid %s input', (json) => {
    const { addForm$, component } = setup();
    component.formFieldsJSON.set(json);

    component.importForm();

    expect(addForm$).not.toHaveBeenCalled();
  });

  it('passes a valid form to the form service', () => {
    const { addForm$, component } = setup();
    component.formName.set('New Form');
    component.formFieldsJSON.set('[{"type":"input"}]');

    component.importForm();

    expect(addForm$).toHaveBeenCalledWith(
      'New Form',
      [{ type: 'input' }],
      {},
      'form-material',
      true,
      null,
    );
  });

  it('leaves persistence failures handled by the import subscription', () => {
    const addForm$ = vi.fn(() => throwError(() => new Error('private failure detail')));
    const { component } = setup(addForm$);
    component.formFieldsJSON.set('[]');

    component.importForm();

    expect(addForm$).toHaveBeenCalled();
  });
});
