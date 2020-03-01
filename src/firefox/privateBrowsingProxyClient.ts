import {
    HandlerCommandKey,
    IFirefoxProxyRequest,
    IFirefoxProxyResponse,
    SeparatorKey,
} from './privateBrowsingProxyCommon';

class FirefoxProxyClient {
    static create(dispatchFunction: (message: IFirefoxProxyRequest) => Promise<IFirefoxProxyResponse>) {
        return FirefoxProxyClient.createInternal('', dispatchFunction);
    }

    private static createInternal(path: string,
                                  dispatchFunction: (message: IFirefoxProxyRequest)
                                  => Promise<IFirefoxProxyResponse>): ProxyHandler<FirefoxProxyClient> {
        return new Proxy(() => {
            throw new Error('Should never be called');
        }, new FirefoxProxyClient(path, dispatchFunction));
    }

    private constructor(private path: string,
                        private dispatchFunction: (message: IFirefoxProxyRequest) => Promise<IFirefoxProxyResponse>) {
    }

    get(_: object, property: string) {
        const nextPath = this.path === '' ? property : this.path + SeparatorKey + property;
        return FirefoxProxyClient.createInternal(nextPath, this.dispatchFunction);
    }

    async apply(_1: object, _2: object, argumentsList: any[]): Promise<any> {
        const busSendMessage: IFirefoxProxyRequest = {
            key: this.path,
            value: argumentsList,
            command: HandlerCommandKey,
        };

        const response = await this.dispatchFunction(busSendMessage);

        if (response.type === 'const') {
            return response.value;
        }

        if (response.type === 'err') {
            throw new Error(response.value);
        }

        throw new Error('Can only proxy constant values');
    }
}

export const firefoxClient = (dispatchFunction: (message: IFirefoxProxyRequest)
    => Promise<IFirefoxProxyResponse>): any => {
    return {
        bitwardenMain: FirefoxProxyClient.create(dispatchFunction),
    };
};
