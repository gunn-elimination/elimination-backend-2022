import { readFileSync } from "fs";

export const env = {
  port: 443, // <-- default port to listen
  mongo: "", // <-- put your mongo connection URL here
  jwtSecret: readFileSync("./keys/private.key", "utf8"), // <-- put your JWT secret here
  email: {
    email: "", // <-- put your email here
    password: "", // <-- put your password here
  },
};
export default env;
