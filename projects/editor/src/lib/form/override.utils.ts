import * as _ from 'lodash';
import { IEditorFormlyField, IFormOverride } from '../editor.types';
import { getFieldChildren } from './form.utils';

interface INode {
    value: IEditorFormlyField | IEditorFormlyField[];
    id: string | null;
    keyPath: string | null;
    parent: INode | null;
}

const _selector = /(?<flag>#)?(?<id>[^:]+)((::)(?<action>.+))?/;

/** NOTE: translate is mutating the form */
// TODO add support for overriding arrays like radio-type 'options' template option.
export const overrideFields = (base: any[], override: IFormOverride): any[] => _override(base, override.override);

const _insert = (group: any[], idx: number, data: any): void => {
    if (_.isArray(data)) {
        group.splice(idx, 0, ...data);
    } else {
        group.splice(idx, 0, data);
    }
};

const _override = (base: any, translation?: Record<string, any>): any => {
    // do nothing if translation rules are not specified
    if (_.isEmpty(translation)) {
        return base;
    }
    // STEP 1: build id-index and key-index
    const nodes: INode[] = [];
    const byId: Record<string, INode> = {};
    const byKey: Record<string, INode> = {};
    const walk = (parent: INode | null, value: IEditorFormlyField | IEditorFormlyField[], keyPath: string | null) => {
        if (_.isArray(value)) {
            const node: INode = { value, id: null, keyPath: null, parent };
            nodes.push(node);
            _.each(value, child => walk(node, child, keyPath));
        } else if (_.isPlainObject(value)) {
            const node: INode = {
                value,
                id: value.id ?? null,
                keyPath: _.isNil(value.key)
                    ? null
                    : _.isEmpty(keyPath)
                    ? (value.key as string)
                    : `${keyPath}.${value.key}`,
                parent,
            };
            if (!_.isNil(node.id)) {
                byId[node.id] = node;
            }
            if (!_.isNil(node.keyPath)) {
                byKey[node.keyPath] = node;
            }
            nodes.push(node);

            // Process children (e.g. 'fieldGroup')
            const fieldInfo = value._info;
            if (fieldInfo.canHaveChildren) {
                const children: IEditorFormlyField[] = getFieldChildren(value);
                _.each(children, child => walk(node, child, node.keyPath ?? keyPath));
            }
        }
    };
    // start DFS from the root
    walk(null, base, null);

    // STEP 2: process translation rules
    _.each(translation, (data, k) => {
        // named capture groups are handy
        const matchGroups = k.match(_selector)?.groups;
        if (matchGroups) {
            const isId = matchGroups.flag === '#';
            const nodeId = matchGroups.id;
            const action = matchGroups.action ?? 'merge';
            // RULE No.1, node must exist by selector
            const node = isId ? byId[nodeId] : byKey[nodeId];
            if (node) {
                const field: IEditorFormlyField = node.value as IEditorFormlyField;
                const siblings: IEditorFormlyField[] = node.parent?.value as IEditorFormlyField[];
                const children: IEditorFormlyField[] = getFieldChildren(field);
                if (action === 'merge') {
                    _.merge(node.value, data);
                    field._info.fieldOverride = data;
                } else if (action === 'add-before') {
                    const group = siblings;
                    if (_.isArray(group)) {
                        const idx = _.indexOf(group, node.value);
                        if (idx >= 0) {
                            _insert(group, idx, data);
                        }
                    }
                } else if (action === 'add-after') {
                    const group = siblings;
                    if (_.isArray(group)) {
                        const idx = _.indexOf(group, node.value);
                        if (idx >= 0) {
                            _insert(group, idx + 1, data);
                        }
                    }
                } else if (action === 'add-first') {
                    const group = children;
                    if (_.isArray(group)) {
                        _insert(group, 0, data);
                    }
                } else if (action === 'add-last') {
                    const group = children;
                    if (_.isArray(group)) {
                        if (_.isArray(data)) {
                            group.push(...data);
                        } else {
                            group.push(data);
                        }
                    }
                }
            }
        }
    });
    return base;
};
