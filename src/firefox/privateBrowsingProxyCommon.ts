export const SeparatorKey: string = '.';
export const HandlerCommandKey: string = 'firefoxBgWindowProxy';

export interface IFirefoxProxyRequest {
    key: string;
    command: string;
    value?: any;
}

export interface IFirefoxProxyResponse {
    type: string;
    value?: any;
}
