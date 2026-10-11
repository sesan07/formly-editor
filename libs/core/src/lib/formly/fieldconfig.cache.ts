import {
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  UntypedFormArray,
  UntypedFormGroup,
  ValidatorFn,
} from '@angular/forms';
import { FieldType, FormlyExtension, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Observable, Subscription } from 'rxjs';

export interface FormlyFieldConfigCache extends FormlyFieldConfig {
  form?: UntypedFormGroup | UntypedFormArray;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model?: any;
  formControl?: AbstractControl & {
    _fields?: FormlyFieldConfigCache[];
    _childrenErrors?: Record<string, () => void>;
  };
  parent?: FormlyFieldConfigCache;
  options?: FormlyFormOptionsCache;
  shareFormControl?: boolean;
  index?: number;
  _localFields?: FormlyFieldConfigCache[];
  _elementRefs?: ElementRef[];
  _expressions?: Record<
    string,
    {
      callback?: (ingoreCache: boolean) => boolean;
      paths?: string[];
      subscription?: Subscription | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value$?: Observable<any>;
    }
  >;
  _hide?: boolean;
  _validators?: ValidatorFn[];
  _asyncValidators?: AsyncValidatorFn[];
  _componentRefs?: (ComponentRef<FieldType> | EmbeddedViewRef<FieldType>)[];
  _proxyInstance?: FormlyExtension;
  _keyPath?: {
    key: FormlyFieldConfig['key'];
    path: string[];
  };
}

export interface FormlyFormOptionsCache extends FormlyFormOptions {
  checkExpressions?: (field: FormlyFieldConfig, ingoreCache?: boolean) => void;
  _viewContainerRef?: ViewContainerRef;
  _injector?: Injector;
  _hiddenFieldsForCheck?: { field: FormlyFieldConfigCache; default?: boolean }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _initialModel?: any;
  _detectChanges?: (field: FormlyFieldConfig) => void;
}
