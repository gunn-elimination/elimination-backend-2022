import { Encryptions } from "./src/Helpers/Encryptions";

Promise.all([
  Encryptions.issueAppToken("Disadus", Date.now()),
  Encryptions.issueAppToken("Gunn.One", Date.now()),
  Encryptions.issueAppToken("WATT", Date.now()),
  Encryptions.issueAppToken("Standalone", Date.now()),
]).then(console.log);
