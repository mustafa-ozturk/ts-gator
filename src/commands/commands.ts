export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export const registerCommand = (
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) => {
  registry[cmdName] = handler;
};

export const runCommand = async (
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) => {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
};
