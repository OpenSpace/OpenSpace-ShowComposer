declare module 'openspace-api-js' {
  export class OpenSpaceApi {
    constructor(socket: Socket);
    onConnect(callback: () => void): void;
    onDisconnect(callback: () => void): void;
    connect(): void;
    disconnect(): void;

    startTopic(type: string, payload: any): Topic;
    authenticate(secret: string): Promise<any>;
    setProperty(property: string, value: any): void;
    getProperty(property: string): Promise<any>;
    getDocumentation(type: string): Promise<any>;
    subscribeToProperty(property: string): Topic;
    executeLuaScript(
      script: string,
      getReturnValue: Boolean,
      shouldBeSynchronized: Boolean,
    ): Promise<any>;
    executeLuaFunction(fun: string, getReturnValue: Boolean): Promise<any>;
    library(multireturn?: boolean | undefined): Promise<any>;

    singleReturnLibrary(): Promise<any>;
    multiReturnLibrary(): Promise<any>;
  }
  export class Socket {
    /** Internal usage only */
    constructor(host: string, port: number);
  }

  export class Topic {
    iterator: AsyncGenerator<any, void, unknown>;
    talk: (payload: any) => void;
    cancel: () => void;
  }

  export default function (host: string, port: number): OpenSpaceApi;
}
