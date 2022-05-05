import { get, set } from 'lodash-es';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';
import { IPropertyValueChange, PropertyValueChangeType } from './property.types';

export const changePropertyTarget = (change: IPropertyValueChange, rootTarget: IEditorFormlyField | Record<string, unknown>) => {
    if (!change.path) {
        console.error('Cannot change property without path');
        return;
    }

    switch(change.type) {
        case PropertyValueChangeType.ADD:
        case PropertyValueChangeType.MODIFY:
            set(rootTarget, change.path, change.value);
            break;
        case PropertyValueChangeType.REMOVE:
            const pathSegments: string[] = change.path.split('.');
            const isRootChange = pathSegments.length === 1;

            const key: string = pathSegments[pathSegments.length - 1];
            const target: unknown = isRootChange
                ? rootTarget
                : get(rootTarget, pathSegments.slice(0, pathSegments.length - 1).join('.'));

            if (Array.isArray(target)) {
                target.splice(+key, 1);
            } else {
                delete target[key];
            }
            break;
    }
};
