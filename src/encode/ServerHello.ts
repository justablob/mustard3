import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface ServerHello {
  ServerRandom: Buffer;
  ClientSalt: Buffer;
  ServerSalt: Buffer;
  ClientPrekeySalt: Buffer;
}

export function is (obj: any): obj is ServerHello {
  return (
    obj != null &&
    Buffer.isBuffer(obj.ServerRandom) && obj.ServerRandom.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ClientSalt) && obj.ClientSalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ServerSalt) && obj.ServerSalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ClientPrekeySalt) && obj.ClientPrekeySalt.length === _param.SALT_LENGTH
  );
}

export function length (obj: ServerHello) {
  return 1 + (
    4 * _param.SALT_LENGTH
  );
}

export function read (buffer: Buffer): ServerHello {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.ServerHello) return null;

  let ServerRandom = reader.read(_param.SALT_LENGTH);
  let ClientSalt = reader.read(_param.SALT_LENGTH);
  let ServerSalt = reader.read(_param.SALT_LENGTH);
  let ClientPrekeySalt = reader.read(_param.SALT_LENGTH);

  if (!ServerRandom || !ClientSalt || !ServerSalt || !ClientPrekeySalt) return null;

  return {
    ServerRandom,
    ClientSalt,
    ServerSalt,
    ClientPrekeySalt,
  };
}

export function write (obj: ServerHello, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.ServerHello]);
  writer.write(obj.ServerRandom);
  writer.write(obj.ClientSalt);
  writer.write(obj.ServerSalt);
  writer.write(obj.ClientPrekeySalt);

  return writer.buffer;
}