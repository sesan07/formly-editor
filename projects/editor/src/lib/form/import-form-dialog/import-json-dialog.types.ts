export interface ImportJSONRequest {
    type: string;
    showName?: boolean;
}

export interface ImportJSONResponse {
    name?: string;
    json: string;
}
