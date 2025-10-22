/**
 * 命令模式 - 支持撤销/重做功能
 */

/**
 * 命令接口
 */
export interface Command {
  /**
   * 执行命令
   */
  execute(): void | Promise<void>;

  /**
   * 撤销命令
   */
  undo(): void | Promise<void>;

  /**
   * 重做命令（默认调用 execute）
   */
  redo?(): void | Promise<void>;

  /**
   * 命令描述
   */
  description?: string;
}

/**
 * 命令历史记录
 */
interface CommandHistoryItem {
  command: Command;
  timestamp: number;
  executed: boolean;
}

/**
 * 命令管理器
 */
export class CommandManager {
  private history: CommandHistoryItem[] = [];
  private currentIndex = -1;
  private maxHistory: number;
  private isExecuting = false;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  /**
   * 执行命令
   */
  async execute(command: Command): Promise<void> {
    if (this.isExecuting) {
      throw new Error('[CommandManager] Another command is being executed');
    }

    this.isExecuting = true;

    try {
      await command.execute();

      // 如果当前不在历史记录的末尾，删除后续记录
      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1);
      }

      // 添加到历史记录
      this.history.push({
        command,
        timestamp: Date.now(),
        executed: true,
      });

      this.currentIndex = this.history.length - 1;

      // 限制历史记录大小
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 撤销
   */
  async undo(): Promise<boolean> {
    if (this.isExecuting) {
      console.warn('[CommandManager] Cannot undo while executing a command');
      return false;
    }

    if (this.currentIndex < 0) {
      return false;
    }

    this.isExecuting = true;

    try {
      const item = this.history[this.currentIndex];
      if (item && item.executed) {
        await item.command.undo();
        item.executed = false;
        this.currentIndex--;
        return true;
      }
    } finally {
      this.isExecuting = false;
    }

    return false;
  }

  /**
   * 重做
   */
  async redo(): Promise<boolean> {
    if (this.isExecuting) {
      console.warn('[CommandManager] Cannot redo while executing a command');
      return false;
    }

    if (this.currentIndex >= this.history.length - 1) {
      return false;
    }

    this.isExecuting = true;

    try {
      const nextIndex = this.currentIndex + 1;
      const item = this.history[nextIndex];
      if (item && !item.executed) {
        if (item.command.redo) {
          await item.command.redo();
        } else {
          await item.command.execute();
        }
        item.executed = true;
        this.currentIndex = nextIndex;
        return true;
      }
    } finally {
      this.isExecuting = false;
    }

    return false;
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 获取历史记录
   */
  getHistory(): Array<{ description?: string; timestamp: number; executed: boolean }> {
    return this.history.map((item) => ({
      description: item.command.description,
      timestamp: item.timestamp,
      executed: item.executed,
    }));
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

/**
 * 创建简单命令
 */
export function createCommand(config: {
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
  redo?: () => void | Promise<void>;
  description?: string;
}): Command {
  return {
    execute: config.execute,
    undo: config.undo,
    redo: config.redo,
    description: config.description,
  };
}

/**
 * 组合命令 - 将多个命令组合成一个
 */
export class CompositeCommand implements Command {
  private commands: Command[];
  description?: string;

  constructor(commands: Command[], description?: string) {
    this.commands = commands;
    this.description = description;
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute();
    }
  }

  async undo(): Promise<void> {
    // 逆序撤销
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i]!.undo();
    }
  }

  async redo(): Promise<void> {
    for (const command of this.commands) {
      if (command.redo) {
        await command.redo();
      } else {
        await command.execute();
      }
    }
  }
}

