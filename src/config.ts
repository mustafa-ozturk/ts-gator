import os from "os";
import fs from "fs";
import path from "path";

const CONFIG_FILE_NAME = ".gatorconfig.json";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

// writes a Config object to the JSON file after setting the current_user_name field.
export const setUser = (userName: string) => {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
};

// reads the JSON file found at ~/.gatorconfig.json and returns a Config object
export const readConfig = (): Config => {
  const fullPath = getConfigFilePath();

  const data = fs.readFileSync(fullPath, { encoding: "utf-8" });
  const rawConfig = JSON.parse(data);

  return validateConfig(rawConfig);
};

// utilities

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

const getConfigFilePath = () => {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
};

const writeConfig = (config: Config) => {
  const fullPath = getConfigFilePath();

  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  const data = JSON.stringify(rawConfig, null, 2);
  fs.writeFileSync(fullPath, data, { encoding: "utf-8" });
};
