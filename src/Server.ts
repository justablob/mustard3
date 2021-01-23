import crypto from "@justablob/commoncrypto";

import * as _param from "./_param";
import * as encode from "./encode";

export default class Server {

  public isValid: boolean = false;

  public Identifier: string;

  private ServerRandom: Buffer;
  private ClientRandom: Buffer;

  private ClientSalt: Buffer;
  private ServerSalt: Buffer;

  private ClientPrekeySalt: Buffer;
  private ServerPrekeySalt: Buffer;

  private ClientSaltedPrekey: Buffer;
  private ServerSaltedPrekey: Buffer;

  private encryptedCredential: Buffer;
  private ServerSaltedCredential: Buffer;

  constructor () {
    this.ServerRandom = crypto.random(_param.SALT_LENGTH);
  }

  SetStored(_data?: Buffer | false): boolean {
    if (!_data) return this.isValid = false;
    try {
      let data = encode.Stored.read(_data);
      if (!data) return this.isValid = false;

      this.ClientSalt = data.ClientSalt;
      this.ServerSalt = data.ServerSalt;
      this.ClientPrekeySalt = data.ClientPrekeySalt;
      this.ServerPrekeySalt = data.ServerPrekeySalt;

      this.encryptedCredential = data.EncryptedToken;

      return this.isValid = true;
    } catch (err) {
      return this.isValid = false;
    }
  }

  ClientHello(_data: Buffer): boolean {
    try {
      let data = encode.ClientHello.read(_data);
      if (!data) return this.isValid = false;

      this.Identifier = data.Identifier;

      this.ClientRandom = data.ClientRandom;
      while (this.ServerRandom.equals(this.ClientRandom)) this.ServerRandom = crypto.random(_param.SALT_LENGTH);

      return this.isValid = true;
    } catch (err) {
      return this.isValid = false;
    }
  }

  ServerHello(): Buffer {
    try {
      if (!this.isValid || !this.encryptedCredential) return null;

      return encode.ServerHello.write({
        ServerRandom: this.ServerRandom,
        ClientSalt: this.ClientSalt,
        ServerSalt: this.ServerSalt,
        ClientPrekeySalt: this.ClientPrekeySalt,
      });
    } catch (err) {
      return null;
    }
  }

  ClientFinished(_data: Buffer): boolean {
    try {
      let data = encode.ClientFinished.read(_data);
      if (!data) return this.isValid = false;


      this.ClientSaltedPrekey = data.ClientSaltedPrekey;
      this.ServerSaltedPrekey = crypto.derive_key(this.ServerPrekeySalt, this.ClientSaltedPrekey, _param.CRYPTO.AUTHENTICATED_SYMMETRIC_ALGORITHM_KEY_LENGTH, "ServerSaltedPrekey");

      this.ServerSaltedCredential = crypto.authenticated_symmetric_decrypt_prefixed(this.ServerSaltedPrekey, this.encryptedCredential);

      let generatedClientResponse = crypto.derive_key(this.ServerSaltedCredential, Buffer.concat([this.ClientRandom, this.ServerRandom], _param.SALT_LENGTH * 2), undefined, "ClientVerifier");

      return this.isValid = crypto.timing_safe_equal(data.ClientVerifier, generatedClientResponse);
    } catch (err) {
      return false;
    }
  }

  GetSharedKey(key: Buffer = Buffer.alloc(0)): Buffer {
    let hashedKey = crypto.hash(key);
    let unmixedSharedKey = crypto.derive_key(hashedKey, Buffer.concat([this.ClientRandom, this.ServerRandom], _param.SALT_LENGTH * 2), undefined, "UnmixedSharedKey");
    let mixedSharedKey = crypto.derive_key(this.ServerSaltedCredential, unmixedSharedKey, undefined, "MixedSharedKey");

    return mixedSharedKey;
  }

  ServerFinished(): Buffer {
    try {
      if (!this.isValid) return null;

      let ServerVerifier = crypto.derive_key(this.ServerSaltedCredential, Buffer.concat([this.ServerRandom, this.ClientRandom], _param.SALT_LENGTH * 2), undefined, "ServerVerifier");

      return encode.ServerFinished.write({
        ServerVerifier,
      });
    } catch (err) {
      return null;
    }
  }
}