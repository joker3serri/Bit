import { promisify } from 'util';
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
        return new Proxy(() => {}, new FirefoxProxyClient(path, dispatchFunction));
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

        console.log(`${this.path}> ${JSON.stringify(busSendMessage)}`);
        const response = await this.dispatchFunction(busSendMessage);
        console.log(`${this.path}< ${JSON.stringify(response)}`);

        if (response.type === 'const') {
            console.log(`${this.path} Proxy returning value ${response.value}`)
            return response.value;
        }

        if (response.type === 'err') {
            console.log('Throwing exception due to error response');
            throw new Error(response.value);
        }

        console.log('Throwing exception due to non-const value');
        throw new Error('Can only proxy constant values');
    }
}

export const firefoxClient = (dispatchFunction: (message: IFirefoxProxyRequest) => void): any => {
    const dispatchFunctionPromisified: (message: IFirefoxProxyRequest)
        => Promise<IFirefoxProxyResponse> = promisify(dispatchFunction);

    return {
        bitwardenMain: FirefoxProxyClient.create(dispatchFunctionPromisified)
    };
};

/*
class FirefoxProxyClient2 {
    constructor(private prefix: string,
                private dispatchFunction: (message: IFirefoxProxyRequest) => Promise<IFirefoxProxyResponse>) {
    }

    has(_: object, key: string) {
        return !!this.get(_, key);
    }

    get(_: object, property: string) {
        return this.callOverMessageBus('get', property);
    }

    // set(_: object, property: string, value: any) {
    //     return this.callOverMessageBus(
    //         'set',
    //         property,
    //         value
    //     );
    // }

    // ownKeys(_: object) {
    //     return this.callOverMessageBus(
    //         'list'
    //     );
    // }

    // deleteProperty(_: object, property: string) {
    //     return this.set(_, property, void(0));
    // }

    apply(_1: object, _2: object, argumentsList: any[]) {
        return this.callOverMessageBus('func', null, argumentsList);
    }

    private generateLookupKey(key: string): string {
        if (!key) {
            return this.prefix;
        }
        if (this.prefix === '') {
            return key;
        }
        return this.prefix + SeparatorKey + key;
    }

    private async callOverMessageBus(type: string, key?: string, value?: any): Promise<any> {
        const lookupKey = this.generateLookupKey(key);
        const busSendMessage: IFirefoxProxyRequest = {
            type: type,
            key: lookupKey,
            value: value,
            command: HandlerCommandKey,
        };

        console.log(`${this.prefix}> ${JSON.stringify(busSendMessage)}`);
        const response = await this.dispatchFunction(busSendMessage);
        console.log(`${this.prefix}< ${JSON.stringify(response)}`);

        if (response.type === 'err') {
            throw new Error(response.value);
        }

        if (response.type === 'const') {
            return response.value;
        }

        if (response.type === 'func') {
            const funcCall = new FirefoxProxyClient(lookupKey, this.dispatchFunction);
            return (...args: any[]) => funcCall.apply(null, null, args);
        }

        return new Proxy({}, new FirefoxProxyClient(lookupKey, this.dispatchFunction));
    }
}

export const firefoxClient = (dispatchFunction: (message: IFirefoxProxyRequest) => void): any => {
    const dispatchFunctionPromisified: (message: IFirefoxProxyRequest)
        => Promise<IFirefoxProxyResponse> = promisify(dispatchFunction);

    return {
        bitwardenMain: new Proxy({}, {
            get: (_, serviceName: string) => new Proxy({}, new FirefoxProxyClient(serviceName, dispatchFunctionPromisified))
        })
    };
};*/
