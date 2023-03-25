export interface ImportJSONData {
    title: string;
    primaryActionText: string;
    defaultValue?: ImportJSONValue;
    name?: {
        pattern?: RegExp;
        placeholder?: string;
    };
    canSelectFile?: boolean;
}
export interface ImportJSONValue {
    name?: string;
    json: string;
}
