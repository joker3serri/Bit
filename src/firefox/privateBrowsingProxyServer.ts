import {
    HandlerCommandKey,
    IFirefoxProxyResponse,
    IFirefoxProxyRequest,
    SeparatorKey,
} from './privateBrowsingProxyCommon';

const CONST_TYPES = ['string', 'number', 'undefined'];

interface IParentChildObject {
    parent: any;
    child: any;
}

let exclude: string[] = [];
const getPropertiesList = (obj: any): string[] => {
    let properties = new Set()
    let currentObj = obj
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()]
        .map(item => item.toString())
        .filter((item: string) => exclude.includes(item));
};
exclude = getPropertiesList({});

export class FirefoxProxyReceiver {
    constructor(private rootObject: any) {
        this.handleMessage = this.handleMessage.bind(this);
    }

    handleMessage(request: IFirefoxProxyRequest) : undefined | boolean {
        if (request.command === HandlerCommandKey) {
            (async () => {
                const respMsg = await this.receiveCallOverMessageBus(request);
                sendResponse(respMsg);
            })();
            return true;
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
            return getPropertiesList(obj).every(prop => this.isConstantType(obj[prop]));
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
            console.log(`${message.key}(${JSON.stringify(message.value)}) === ${result}`);
            const respMsg = this.getResponseMessage(result);
            console.log('Backend returning ' + JSON.stringify(respMsg));
            return respMsg;
        } catch (e) {
            console.log('EXCEPTION IN PROXY SERVER');
            console.error(e.message);
            console.error(e.stack);
            return {
                type: 'err',
                value: e.message,
            };
        }
    }
}

// export class FirefoxProxyReceiver {
//     constructor(private rootObject: any) {
//         this.handleMessage = this.handleMessage.bind(this);
//     }

//     async handleMessage(request: IFirefoxProxyRequest): undefined | Promise<IFirefoxProxyResponse> {
//         if (request.command === HandlerCommandKey) {
//             return (async () => {
//                 return await this.receiveCallOverMessageBus(request);
//             })();
//         }
//     }

//     private getRequestedObject(path: string[]): any {
//         if (path.length === 0 || path[0] === '') {
//             return this.rootObject;
//         }

//         return path.reduce((acc: any, curr: string) => acc[curr], this.rootObject);
//     }

//     private getParentAndChildObject(path: string): IParentChildObject {
//         const setSpl = path.split(SeparatorKey);
//         const parent = this.getRequestedObject(setSpl.slice(0, setSpl.length - 1));
//         const childKey = setSpl[setSpl.length - 1];
//         return {
//             parent: parent,
//             childKey: childKey,
//             child: parent[childKey],
//         };
//     }

//     private isConstantType(obj: any): boolean {
//         const objType = typeof obj;
//         if (CONST_TYPES.includes(objType) || obj === null) {
//             return true;
//         }
//         if (Array.isArray(obj)) {
//             return obj.every(this.isConstantType);
//         }
//         return false;
//     }

//     private getResponseMessage(obj: any): IFirefoxProxyResponse {
//         if (this.isConstantType(obj)) {
//             return {
//                 type: 'const',
//                 value: obj,
//             };
//         } else if (typeof(obj) === 'function') {
//             return {
//                 type: 'func',
//             };
//         } else {
//             return {
//                 type: 'obj',
//             };
//         }
//     }

//     private async receiveCallOverMessageBus(message: IFirefoxProxyRequest): Promise<IFirefoxProxyResponse> {
//         try {
//             const { parent, child, childKey } = this.getParentAndChildObject(message.key);
//             let result: any = void(0);
//             switch (message.type) {
//                 case 'get':
//                     result = child;
//                     break;
//                 case 'set':
//                     result = (parent[childKey] = message.value);
//                     break;
//                 case 'list':
//                     result = Object.getOwnPropertyNames(child);
//                     break;
//                 case 'func':
//                     result = await child.apply(parent, message.value);
//                     break;
//                 default:
//                     throw new Error('Unknown request');
//             }

//             return this.getResponseMessage(result);
//         } catch (e) {
//             console.error(e.message);
//             console.error(e.stack);
//             return {
//                 type: 'err',
//                 value: e.message,
//             };
//         }
//     }
// }
