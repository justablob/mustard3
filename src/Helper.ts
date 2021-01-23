import crypto from "@justablob/commoncrypto";

import * as _param from "./_param";
import * as encode from "./encode";

function ClientRegister (identifier: string, uCredential: string | Buffer): Buffer {
  let credential = Buffer.isBuffer(uCredential) ? uCredential : Buffer.from(uCredential);

  let ClientSalt = crypto.random(_param.SALT_LENGTH);
  let SaltedCredential = crypto.keyed_hash(ClientSalt, credential);

  let ClientPrekeySalt = crypto.random(_param.SALT_LENGTH);
  let ClientSaltedPrekey = crypto.derive_key(ClientPrekeySalt, SaltedCredential, undefined, "ClientSaltedPrekey");

  return encode.Unstored.write({
    Identifier: identifier,
    ClientSalt,
    ClientPrekeySalt,
    RawToken: SaltedCredential,
    RawPrekey: ClientSaltedPrekey,
  });
}

function ServerRegister (_data: Buffer): [string, Buffer] {
  let data = encode.Unstored.read(_data);
  if (!data) return null;

  let ServerSalt = crypto.random(_param.SALT_LENGTH);
  let ServerSaltedCredential = crypto.keyed_hash(ServerSalt, data.RawToken);

  let ServerPrekeySalt = crypto.random(_param.SALT_LENGTH);
  let ServerSaltedPrekey = crypto.derive_key(ServerPrekeySalt, data.RawPrekey, _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGORITHM_KEY_LENGTH, "ServerSaltedPrekey");

  let EncryptedToken = crypto.authenticated_symmetric_encrypt_prefixed(ServerSaltedPrekey, ServerSaltedCredential);

  return [
    data.Identifier,
    encode.Stored.write({
      EncryptedToken,
      ClientSalt: data.ClientSalt,
      ClientPrekeySalt: data.ClientPrekeySalt,
      ServerSalt,
      ServerPrekeySalt,
    }),
  ];
}

export {
  ClientRegister,
  ServerRegister,
}

export default {
  ClientRegister,
  ServerRegister,
}