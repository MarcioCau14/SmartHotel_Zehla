import 'bullmq';

declare module 'bullmq' {
  export class Worker<T = any, R = any, N extends string = string> {
    constructor(name: string, processor?: any, opts?: any);
    on(event: string, listener: (...args: any[]) => void): this;
    close(): Promise<void>;
  }
}

declare module 'stripe' {
  const Stripe: any;
  export default Stripe;
}
