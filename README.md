```

DISCLAIMER 1: Mustard3 WAS NOT PEER-REVIEWED. DO NOT USE FOR ANY PROJECTS UNDER ANY CIRCUMSTANCES. YOU WILL MOST LIKELY REGRET IT.
DISCLAIMER 2: I'VE NEVER RELEASED A CRYPTOGRAPHIC PROTOCOL BEFORE, AND I HAVEN'T WRITTEN DOCUMENTATION FOR ONE EITHER.
DISCLAIMER 3: THIS COULD VERY WELL BE TERRIBLE, PLEASE DON'T LAUGH AT ME IF I MESSED UP BAD. YOU CAN HELP ME OUT BY OPENING AN ISSUE.

╔═══════════════════════════════════════════╗
║                                           ║
║     Mustard3 Authentication Mechanism     ║
║                                           ║
╚═══════════════════════════════════════════╝

Mustard3, named after my previous failed attempt at a password-based authentication mechanism "Ketchup2", is a credential-based mutual authentication mechanism. Since Ketchup2 and many other aPAKEs suffered from credential stuffing and offline attacks badly, and all around it was quite complicated, it seemed like a good idea to simplify and rebrand it as a way to verify securely generated credentials instead. (imagine API tokens)
Below is a likely lacking documentation of it, hope it's understandable enough. The code in this repository is a Typescript/NodeJS implementation of it. Tested and working on NodeJS 15.5.0, though it should work with lower versions too.

~~~~ Algorithms ~~~~

  ChaCha20-Poly1305 - Authenticated cipher, used to encrypt stored tokens.
  BLAKE2b512        - Hash function, used for all hashing and key derivation throughout the project.

Data is encoded in a compact binary format.

~~~~ Flow ~~~~

<- ClientHello
    $Identifier ::
        Credential Identifier.

    ClientRandom ::
        32 random bytes from the client.

-> ServerHello
    ServerRandom ::
        32 random bytes from the server.

    ClientSalt ::
        Salt the client uses.

    ServerSalt ::
        Salt the server uses.

    ClientPrekeySalt ::
        Salt the client uses for the prekey.

-- Client
    SaltedCredential :: HMAC(ServerHello.ClientSalt, $Credential)
        Used to calculate ServerKey.

    ServerSaltedCredential :: HMAC(ServerHello.ServerSalt, Client.SaltedCredential)
        Used to create verifiers. The server stores this in an encrypted form.

<- ClientLast
    ClientSaltedPrekey :: HKDF(ServerFirst.ClientPrekeySalt, Client.SaltedCredential, 64, "ClientSaltedPrekey")
        Key used to decrypt the credential hash on the server.

    ClientResponse :: HKDF(Client.ServerSaltedCredential, ClientHello.ClientRandom | ServerHello.ServerRandom, 64, "ClientVerifier")
        Client verifier.

-- Server
    StoredCredential ::
        Encrypted credential hash, retrieved from database.

    ServerSaltedPrekey :: HKDF(Server.ServerPrekeySalt, ClientLast.ClientSaltedPrekey, 32, "ServerSaltedPrekey")
        Key used to decrypt StoredToken into ServerSaltedCredential.

    ServerSaltedCredential :: Decrypt(Server.ServerPartialKey, Server.StoredToken)
        Equal to Client.ServerSaltedCredential.

-> ServerLast
    ServerVerifier :: HKDF(Server.ServerSaltedCredential, ServerHello.ServerRandom | ClientHello.ClientRandom, 64, "ServerVerifier")
        Server verifier.

// At this point, both sides have enough information to validate each others responses, without having disclosed enough information to allow a possible man in the middle steal any sensitive data or impersonate the user, given the man in the middle does not have access to the server database, or otherwise infiltrated one of the two sides. They can also derive an ephermal shared key.

~~~~ Functions ~~~~

x | y - concatenation of x and y

Hash(data) - BLAKE2b512 over data
HMAC(key, data) - BLAKE2b512 keyed HMAC over data
HKDF(key, data, length = 64, info) - HKDF-BLAKE2b512 over key, data, info with output length.
Decrypt(key, data) - Decrypts data using chacha20-poly1305 using key as key and the first 12 bytes of data as IV.
Encrypt(key, data) - Encrypts data using chacha20-poly1305 using key as key and generating a random IV.

~~~~ Symbols and Terminology ~~~~

// : Annotation
-- : Value used locally
<- : Client to Server
-> : Server to Client

```