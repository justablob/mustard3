export * as ClientHello from "./ClientHello";
export * as ServerHello from "./ServerHello";
export * as ClientFinished from "./ClientFinished";
export * as ServerFinished from "./ServerFinished";
export * as Unstored from "./Unstored";
export * as Stored from "./Stored";

export function wrapConditional <T, Ts, R> (condition: boolean, func: (arg: T, ...args: Ts[]) => R, arg: T, ...args: Ts[]): R | T {
  if (condition) {
    return func(arg, ...args);
  } else {
    return arg;
  }
}

export enum Identifiers {
  ClientHello = 0x31,
  ServerHello = 0x32,
  ClientFinished = 0x33,
  ServerFinished = 0x34,
  Unstored = 0x3a,
  Stored = 0x3b,
  Abort = 0x3f,
}