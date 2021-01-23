import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface ClientHello {
  Identifier: string;
  ClientRandom: Buffer;
}

export function is (obj: any): obj is ClientHello {
  return (
    obj != null &&
    typeof obj.Identifier === "string" && obj.Identifier.length > 0 && obj.Identifier.length <= 255 &&
    Buffer.isBuffer(obj.ClientRandom) && obj.ClientRandom.length === _param.SALT_LENGTH
  );
}

export function length (obj: ClientHello) {
  return 1 + (
    1 + Buffer.byteLength(obj.Identifier) +
    _param.SALT_LENGTH
  );
}

export function read (buffer: Buffer): ClientHello {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.ClientHello) return null;

  let identifierLength = reader.readByte();

  let Identifier = reader.readString(identifierLength);
  let ClientRandom = reader.read(_param.SALT_LENGTH);

  if (!Identifier || !ClientRandom) return null;

  return {
    Identifier,
    ClientRandom,
  };
}

export function write (obj: ClientHello, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.ClientHello, Buffer.byteLength(obj.Identifier)]);
  writer.writeString(obj.Identifier);
  writer.write(obj.ClientRandom);

  return writer.buffer;
}