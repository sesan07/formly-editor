export interface ExportJSONRequest {
    type: string;
    name?: string;
    json: string;
}

export interface ExportJSONResponse {
    name: string;
    json: string;
}
