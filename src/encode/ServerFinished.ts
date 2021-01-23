import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface ServerFinished {
  ServerVerifier: Buffer;
}

export function is (obj: any): obj is ServerFinished {
  return (
    obj != null &&
    Buffer.isBuffer(obj.ServerVerifier) && obj.ServerVerifier.length === _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function length (obj: ServerFinished) {
  return 1 + (
    _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function read (buffer: Buffer): ServerFinished {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.ServerFinished) return null;

  let ServerVerifier = reader.read(_param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH);

  if (!ServerVerifier) return null;

  return {
    ServerVerifier,
  };
}

export function write (obj: ServerFinished, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.ServerFinished]);
  writer.write(obj.ServerVerifier);

  return writer.buffer;
}