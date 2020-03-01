import {
    HandlerCommandKey,
    IFirefoxProxyRequest,
    IFirefoxProxyResponse,
    SeparatorKey,
} from './privateBrowsingProxyCommon';

const CONST_TYPES = ['string', 'number', 'undefined'];

interface IParentChildObject {
    parent: any;
    child: any;
}

let exclude: string[] = [];
const getPropertiesList = (obj: any): string[] => {
    const knownProperties = new Set<string>();
    let currentObj: any = obj;
    while (currentObj) {
        Object.getOwnPropertyNames(currentObj)
            .map((item: any) => item.toString())
            .filter((item: string) => !exclude.includes(item))
            .map((item: string) => knownProperties.add(item));
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return [...knownProperties.keys()];
};
exclude = getPropertiesList({});

export class FirefoxProxyReceiver {
    constructor(private rootObject: any) {
        this.handleMessage = this.handleMessage.bind(this);
    }

    handleMessage(request: IFirefoxProxyRequest): undefined | Promise<IFirefoxProxyResponse> {
        if (request.command === HandlerCommandKey) {
            return (async () => await this.receiveCallOverMessageBus(request))();
        }
    }

    private getRequestedObject(path: string[]): any {
        if (path.length === 0 || path[0] === '') {
            return this.rootObject;
        }

        return path.reduce((acc: any, curr: string) => acc[curr], this.rootObject);
    }

    private getParentAndChildObject(path: string): IParentChildObject {
        const setSpl = path.split(SeparatorKey);
        const parent = this.getRequestedObject(setSpl.slice(0, setSpl.length - 1));
        const childKey = setSpl[setSpl.length - 1];
        return {
            parent: parent,
            child: parent[childKey],
        };
    }

    private isConstantType(obj: any): boolean {
        const objType = typeof obj;
        if (CONST_TYPES.includes(objType) || obj === null) {
            return true;
        }
        if (Array.isArray(obj)) {
            return obj.every(this.isConstantType);
        }
        if (objType === 'object') {
            return getPropertiesList(obj)
                .every((prop: any) => this.isConstantType(obj[prop]));
        }
        return false;
    }

    private getResponseMessage(obj: any): IFirefoxProxyResponse {
        if (this.isConstantType(obj)) {
            return {
                type: 'const',
                value: obj,
            };
        } else if (typeof(obj) === 'function') {
            return {
                type: 'func',
            };
        } else {
            return {
                type: 'obj',
            };
        }
    }

    private async receiveCallOverMessageBus(message: IFirefoxProxyRequest): Promise<IFirefoxProxyResponse> {
        try {
            const { parent, child } = this.getParentAndChildObject(message.key);
            const result = await child.apply(parent, message.value);
            return this.getResponseMessage(result);
        } catch (e) {
            return {
                type: 'err',
                value: e.message,
            };
        }
    }
}
