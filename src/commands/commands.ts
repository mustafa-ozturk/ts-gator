export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export const registerCommand = (
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) => {
  registry[cmdName] = handler;
};

export const runCommand = (
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) => {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  handler(cmdName, ...args);
};
