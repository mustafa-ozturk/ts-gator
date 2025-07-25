import { readConfig, setUser } from "./config";

const main = () => {
  setUser("moz");
  console.log(readConfig());
};

main();
