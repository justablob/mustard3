import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface ClientFinished {
  ClientSaltedPrekey: Buffer;
  ClientVerifier: Buffer;
}

export function is (obj: any): obj is ClientFinished {
  return (
    obj != null &&
    Buffer.isBuffer(obj.ClientSaltedPrekey) && obj.ClientSaltedPrekey.length === _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH &&
    Buffer.isBuffer(obj.ClientVerifier) && obj.ClientVerifier.length === _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function length (obj: ClientFinished) {
  return 1 + (
    2 * _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function read (buffer: Buffer): ClientFinished {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.ClientFinished) return null;

  let ClientSaltedPrekey = reader.read(_param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH);
  let ClientVerifier = reader.read(_param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH);

  if (!ClientSaltedPrekey || !ClientVerifier) return null;

  return {
    ClientSaltedPrekey,
    ClientVerifier,
  };
}

export function write (obj: ClientFinished, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.ClientFinished]);
  writer.write(obj.ClientSaltedPrekey);
  writer.write(obj.ClientVerifier);

  return writer.buffer;
}