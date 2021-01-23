import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface Unstored {
  Identifier: string;
  ClientSalt: Buffer;
  ClientPrekeySalt: Buffer;
  RawToken: Buffer;
  RawPrekey: Buffer;
}

export function is (obj: any): obj is Unstored {
  return (
    obj != null &&
    typeof obj.Identifier === "string" && obj.Identifier.length > 0 && obj.Identifier.length <= 255 &&
    Buffer.isBuffer(obj.ClientSalt) && obj.ClientSalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ClientPrekeySalt) && obj.ClientPrekeySalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.RawToken) && obj.RawToken.length === _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH &&
    Buffer.isBuffer(obj.RawPrekey) && obj.RawPrekey.length === _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function length (obj: Unstored) {
  return 1 + (
    1 + Buffer.byteLength(obj.Identifier) +
    2 * _param.SALT_LENGTH +
    2 * _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH
  );
}

export function read (buffer: Buffer): Unstored {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.Unstored) return null;

  let identifierLength = reader.readByte();

  let Identifier = reader.readString(identifierLength);
  let ClientSalt = reader.read(_param.SALT_LENGTH);
  let ClientPrekeySalt = reader.read(_param.SALT_LENGTH);

  let RawToken = reader.read(_param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH);
  let RawPrekey = reader.read(_param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH);

  if (!Identifier || !ClientSalt || !ClientPrekeySalt || !RawToken || !RawPrekey) return null;

  return {
    Identifier,
    ClientSalt,
    ClientPrekeySalt,
    RawToken,
    RawPrekey,
  };
}

export function write (obj: Unstored, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.Unstored, Buffer.byteLength(obj.Identifier)]);
  writer.writeString(obj.Identifier);
  writer.write(obj.ClientSalt);
  writer.write(obj.ClientPrekeySalt);
  writer.write(obj.RawToken);
  writer.write(obj.RawPrekey);

  return writer.buffer;
}