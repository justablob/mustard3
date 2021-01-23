import "mocha";
import { assert } from "chai";

import mustard from "../src";

describe("works", () => {
  it("correct", () => {
    let C = new mustard.Client();
    let S = new mustard.Server();

    let identifier = "hoi";
    let credential = "hallo";

    let Sc = mustard.Helper.ClientRegister(identifier, credential);
    let Sh = mustard.Helper.ServerRegister(Sc);

    C.SetCredentials(identifier, credential);

    let Cch = C.ClientHello();
    let Sch = S.ClientHello(Cch);

    assert(Sch);

    if (S.Identifier === identifier) S.SetStored(Sh[1]);

    let Ssh = S.ServerHello();
    let Csh = C.ServerHello(Ssh);

    assert(Csh);

    let Ccf = C.ClientFinished();
    let Scf = S.ClientFinished(Ccf);

    assert(Scf);

    let Ssf = S.ServerFinished();
    let Csf = C.ServerFinished(Ssf);

    assert(Csf);

    let Css = C.GetSharedKey();
    let Sss = S.GetSharedKey();

    assert(Css.equals(Sss));
  });
});