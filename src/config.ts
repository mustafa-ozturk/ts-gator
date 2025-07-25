import os from "os";
import fs from "fs";

const CONFIG_FILE_NAME = ".gatorconfig.json";
const CONFIG_FILE_PATH = `${os.homedir()}/${CONFIG_FILE_NAME}`;

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

// writes a Config object to the JSON file after setting the current_user_name field.
export const setUser = (username: string) => {
  const rawConfig = {
    db_url: "postgres://example",
    current_user_name: username,
  };

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(rawConfig, null, 2));
};

// reads the JSON file found at ~/.gatorconfig.json and returns a Config object
export const readConfig = (): Config => {
  const contents = fs.readFileSync(CONFIG_FILE_PATH, { encoding: "utf-8" });
  return validateConfig(JSON.parse(contents));
};

const validateConfig = (rawConfig: any) => {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is required in config file");
  }
  if (
    !rawConfig.current_user_name ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name is required in config file");
  }

  const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };

  return config;
};
