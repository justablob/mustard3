///////////////////////////////////////////
//                                       //
//   Mustard3 Authentication Mechanism   //
//                                       //
///////////////////////////////////////////

import Client from "./Client";
import Server from "./Server";

import * as encoding from "./encoding";
export * from "./encoding";

import * as Helper from "./Helper";

export {
  Client,
  Server,
  Helper,
}

export default {
  version: "1.0.0",
  ...encoding,

  Client,
  Server,
  Helper,
}