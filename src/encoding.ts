import * as baseX from "base-x";

let base62 = baseX("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

export function encode(buffer: Buffer): string {
  return base62.encode(buffer);
}

export function decode(string: string): Buffer {
  return base62.decode(string);
}