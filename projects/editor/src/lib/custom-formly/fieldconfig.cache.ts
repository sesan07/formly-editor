import { ComponentRef, ElementRef, EmbeddedViewRef, Injector, ViewContainerRef } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, UntypedFormArray, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { FieldType, FormlyExtension, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Observable, Subscription } from 'rxjs';

export interface FormlyFieldConfigCache extends FormlyFieldConfig {
    form?: UntypedFormGroup | UntypedFormArray;
    model?: any;
    formControl?: AbstractControl & {
        _fields?: FormlyFieldConfigCache[];
        // eslint-disable-next-line @typescript-eslint/ban-types
        _childrenErrors?: { [id: string]: Function };
    };
    parent?: FormlyFieldConfigCache;
    options?: FormlyFormOptionsCache;
    shareFormControl?: boolean;
    index?: number;
    _localFields?: FormlyFieldConfigCache[];
    _elementRefs?: ElementRef[];
    _expressions?: {
        [property: string]: {
            callback?: (ingoreCache: boolean) => boolean;
            paths?: string[];
            subscription?: Subscription | null;
            value$?: Observable<any>;
        };
    };
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
    _initialModel?: any;

    /** @deprecated */
    _buildForm?: () => void;

    /** @deprecated */
    _checkField?: (field: FormlyFieldConfig, ingoreCache?: boolean) => void;

    /** @deprecated */
    _markForCheck?: (field: FormlyFieldConfig) => void;
}
