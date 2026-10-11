import { FormlyConfig, provideFormlyCore } from '@ngx-formly/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import z from 'zod';
import { CORE_BUILDER_FORM } from '../formly/types';
import { CORE_LIBRARY_CONFIGS, LibraryConfig } from './types';
import { CoreLibraryService } from './core-library.service';
import { FormlyConfigService } from '../formly/formly-config.service';

const configA: LibraryConfig = {
  id: 'config-a',
  label: 'Config A',
  configOptions: [],
  formTemplates: [],
  schema: z.any(),
  fieldCategoryOptions: [],
  defaultTypeOption: {
    name: 'default',
    displayName: 'Default',
    materialSymbol: 'help',
    defaultConfig: {},
  },
};

const configB: LibraryConfig = { ...configA, id: 'config-b' };
const isolatedConfigA: LibraryConfig = {
  ...configA,
  id: 'isolated-a',
  configOptions: [{ types: [{ name: 'isolated-a-type' }] }],
};
const isolatedConfigB: LibraryConfig = {
  ...configA,
  id: 'isolated-b',
  configOptions: [{ types: [{ name: 'isolated-b-type' }] }],
};

describe('CoreConfigService', () => {
  function createService(configs: LibraryConfig[], isBuilderForm = false): CoreLibraryService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CORE_LIBRARY_CONFIGS, useValue: configs },
        { provide: CORE_BUILDER_FORM, useValue: isBuilderForm },
        CoreLibraryService,
        provideFormlyCore(),
        FormlyConfigService,
      ],
    });
    return TestBed.inject(CoreLibraryService);
  }

  it('activates the sole configured config', () => {
    const service = createService([configA]);

    expect(service.libraryOptions).toEqual([{ id: configA.id, label: configA.label }]);
    expect(service.activeLibrary()).toBeNull();
    service.setActiveLibrary(configA.id);
    expect(service.activeLibrary()).toBe(configA);
  });

  it('has no active config when zero or multiple configs are configured', () => {
    expect(createService([]).activeLibrary()).toBeNull();
    expect(createService([configA, configB]).activeLibrary()).toBeNull();
  });

  it('selects a configured config by id', () => {
    const service = createService([configA, configB]);

    service.setActiveLibrary('config-b');
    expect(service.activeLibrary()).toBe(configB);
  });

  it('rejects unknown ids without changing the active config', () => {
    const service = createService([configA]);
    expect(() => service.setActiveLibrary('missing')).toThrow();
    expect(service.activeLibrary()).toBeNull();
  });

  it('isolates Formly config options when switching profiles', () => {
    const service = createService([isolatedConfigA, isolatedConfigB]);
    const formlyConfigService = TestBed.inject(FormlyConfigService);
    const formlyConfig = TestBed.inject(FormlyConfig);

    service.setActiveLibrary(isolatedConfigA.id);
    formlyConfigService.loadLibraryConfigOptions();
    expect(formlyConfig.getType('isolated-a-type')).not.toBeNull();
    expect(formlyConfig.getType('isolated-b-type')).toBeNull();

    service.setActiveLibrary(isolatedConfigB.id);
    formlyConfigService.loadLibraryConfigOptions();
    expect(formlyConfig.getType('isolated-a-type')).toBeNull();
    expect(formlyConfig.getType('isolated-b-type')).not.toBeNull();

    service.setActiveLibrary(isolatedConfigA.id);
    formlyConfigService.loadLibraryConfigOptions();
    expect(formlyConfig.getType('isolated-a-type')).not.toBeNull();
    expect(formlyConfig.getType('isolated-b-type')).toBeNull();

    service.setActiveLibrary(null);
    formlyConfigService.loadLibraryConfigOptions();
    expect(formlyConfig.getType('isolated-a-type')).toBeNull();
    expect(formlyConfig.getType('isolated-b-type')).toBeNull();
  });

  it('does not reload config options when the active library is unchanged', () => {
    const service = createService([isolatedConfigA]);
    const formlyConfigService = TestBed.inject(FormlyConfigService);
    const formlyConfig = TestBed.inject(FormlyConfig);

    service.setActiveLibrary(isolatedConfigA.id);
    formlyConfigService.loadLibraryConfigOptions();
    formlyConfig.addConfig({ types: [{ name: 'runtime-type' }] });

    formlyConfigService.loadLibraryConfigOptions();

    expect(formlyConfig.getType('runtime-type')).not.toBeNull();
  });

  it('loads editor options only for builder forms and replaces same-name types', () => {
    const runtimeOption = {
      types: [{ name: 'contextual-type', defaultOptions: { props: { context: 'runtime' } } }],
    };
    const builderOption = {
      types: [{ name: 'contextual-type', defaultOptions: { props: { context: 'editor' } } }],
    };
    const config: LibraryConfig = {
      ...configA,
      configOptions: [runtimeOption],
      builderConfigOptions: [builderOption],
    };

    const previewService = createService([config]);
    const previewConfig = TestBed.inject(FormlyConfig);
    previewService.setActiveLibrary(config.id);
    TestBed.inject(FormlyConfigService).loadLibraryConfigOptions();
    expect(previewConfig.getType('contextual-type')?.defaultOptions?.props?.['context']).toBe(
      'runtime',
    );

    const builderService = createService([config], true);
    const builderConfig = TestBed.inject(FormlyConfig);
    builderService.setActiveLibrary(config.id);
    TestBed.inject(FormlyConfigService).loadLibraryConfigOptions();
    expect(builderConfig.getType('contextual-type')?.defaultOptions?.props?.['context']).toBe(
      'editor',
    );
  });
});
