import { Identifiers } from ".";
import Advanceable from "advanceable";

import * as _param from "../_param";

export interface Stored {
  ClientSalt: Buffer;
  ServerSalt: Buffer;
  ClientPrekeySalt: Buffer;
  ServerPrekeySalt: Buffer;
  EncryptedToken: Buffer;
}

export function is (obj: any): obj is Stored {
  return (
    obj != null &&
    Buffer.isBuffer(obj.ClientSalt) && obj.ClientSalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ServerSalt) && obj.ServerSalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ClientPrekeySalt) && obj.ClientPrekeySalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.ServerPrekeySalt) && obj.ServerPrekeySalt.length === _param.SALT_LENGTH &&
    Buffer.isBuffer(obj.EncryptedToken) && obj.EncryptedToken.length === (
      _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGORITHM_IV_LENGTH +
      _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH +
      _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGOTITHM_TAG_LENGTH
    )
  );
}

export function length (obj: Stored) {
  return 1 + (
    4 * _param.SALT_LENGTH +
    (
      _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGORITHM_IV_LENGTH +
      _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH +
      _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGOTITHM_TAG_LENGTH
    )
  );
}

export function read (buffer: Buffer): Stored {
  let reader = new Advanceable(buffer);

  if (reader.readByte() !== Identifiers.Stored) return null;


  let ClientSalt = reader.read(_param.SALT_LENGTH);
  let ServerSalt = reader.read(_param.SALT_LENGTH);
  let ClientPrekeySalt = reader.read(_param.SALT_LENGTH);
  let ServerPrekeySalt = reader.read(_param.SALT_LENGTH);

  let EncryptedToken = reader.read(
    _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGORITHM_IV_LENGTH +
    _param.CRYPTO.HASH_ALGORITHM_OUTPUT_LENGTH +
    _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGOTITHM_TAG_LENGTH
  );

  if (!ClientSalt || !ServerSalt || !ClientPrekeySalt || !ServerPrekeySalt || !EncryptedToken) return null;

  return {
    ClientSalt,
    ServerSalt,
    ClientPrekeySalt,
    ServerPrekeySalt,
    EncryptedToken,
  };
}

export function write (obj: Stored, buffer?: Buffer) {
  if (!is(obj)) return null;

  let writer = new Advanceable(buffer || length(obj), true);

  writer.write([Identifiers.Stored]);
  writer.write(obj.ClientSalt);
  writer.write(obj.ServerSalt);
  writer.write(obj.ClientPrekeySalt);
  writer.write(obj.ServerPrekeySalt);
  writer.write(obj.EncryptedToken);

  return writer.buffer;
}