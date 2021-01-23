import crypto from "@justablob/commoncrypto";

import * as _param from "./_param";
import * as encode from "./encode";

export default class Client {

  private ClientRandom: Buffer;

  private Identifier: string;
  private Credential: Buffer;

  private ServerRandom: Buffer;

  private ClientSalt: Buffer;
  private ServerSalt: Buffer;

  private SaltedCredential: Buffer;
  private ServerSaltedCredential: Buffer;

  private ClientPrekeySalt: Buffer;
  private ClientSaltedPrekey: Buffer;

  constructor() {
    this.ClientRandom = crypto.random(_param.SALT_LENGTH);
  }

  SetCredentials(identifier: string, credential: Buffer | string): boolean {
    this.Identifier = identifier;
    this.Credential = Buffer.isBuffer(credential) ? credential : Buffer.from(credential);

    return true;
  }

  ClientHello(): Buffer {
    return encode.ClientHello.write({
      Identifier: this.Identifier,
      ClientRandom: this.ClientRandom,
    });
  }

  ServerHello(_data: any): boolean {
    try {
      let data = encode.ServerHello.read(_data);

      this.ServerRandom = data.ServerRandom;
      this.ClientSalt = data.ClientSalt;
      this.ServerSalt = data.ServerSalt;
      this.ClientPrekeySalt = data.ClientPrekeySalt;

      if (this.ServerRandom.equals(this.ClientRandom)) return false;

      this.SaltedCredential = crypto.keyed_hash(this.ClientSalt, this.Credential);
      this.ServerSaltedCredential = crypto.keyed_hash(this.ServerSalt, this.SaltedCredential);

      this.ClientSaltedPrekey = crypto.derive_key(this.ClientPrekeySalt, this.SaltedCredential, undefined, "ClientSaltedPrekey");

      return true;
    } catch (err) {
      return false;
    }
  }

  ClientFinished(): Buffer {
    let ClientVerifier = crypto.derive_key(this.ServerSaltedCredential, Buffer.concat([this.ClientRandom, this.ServerRandom], _param.SALT_LENGTH * 2), undefined, "ClientVerifier");

    return encode.ClientFinished.write({
      ClientSaltedPrekey: this.ClientSaltedPrekey,
      ClientVerifier,
    });
  }

  GetSharedKey(key: Buffer = Buffer.alloc(0)): Buffer {
    let hashedKey = crypto.hash(key);
    let unmixedSharedKey = crypto.derive_key(hashedKey, Buffer.concat([this.ClientRandom, this.ServerRandom], _param.SALT_LENGTH * 2), undefined, "UnmixedSharedKey");
    let mixedSharedKey = crypto.derive_key(this.ServerSaltedCredential, unmixedSharedKey, undefined, "MixedSharedKey");

    return mixedSharedKey;
  }

  ServerFinished(_data: Buffer): boolean {
    try {
      let data = encode.ServerFinished.read(_data);

      let generatedServerVerifier = crypto.derive_key(this.ServerSaltedCredential, Buffer.concat([this.ServerRandom, this.ClientRandom], _param.SALT_LENGTH * 2), undefined, "ServerVerifier");

      return crypto.timing_safe_equal(data.ServerVerifier, generatedServerVerifier);
    } catch (err) {
      return false;
    }
  }
}