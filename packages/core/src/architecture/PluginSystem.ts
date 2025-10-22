/**
 * 插件系统 - 支持功能扩展
 */

import type { DatePickerCore } from '../core/DatePickerCore';

/**
 * 插件接口
 */
export interface Plugin {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 插件版本
   */
  version?: string;

  /**
   * 插件依赖
   */
  dependencies?: string[];

  /**
   * 插件安装
   */
  install(core: DatePickerCore, options?: any): void | Promise<void>;

  /**
   * 插件卸载
   */
  uninstall?(core: DatePickerCore): void | Promise<void>;
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  name: string;
  version?: string;
  installed: boolean;
  installedAt?: number;
  options?: any;
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private installedPlugins = new Set<string>();
  private core: DatePickerCore | null = null;

  /**
   * 设置核心实例
   */
  setCore(core: DatePickerCore): void {
    this.core = core;
  }

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" is already registered`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
  }

  /**
   * 安装插件
   */
  async install(pluginName: string, options?: any): Promise<void> {
    if (!this.core) {
      throw new Error('[PluginManager] Core instance is not set');
    }

    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`[PluginManager] Plugin "${pluginName}" is not registered`);
    }

    if (this.installedPlugins.has(pluginName)) {
      console.warn(`[PluginManager] Plugin "${pluginName}" is already installed`);
      return;
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.installedPlugins.has(dep)) {
          throw new Error(
            `[PluginManager] Plugin "${pluginName}" requires "${dep}" to be installed first`
          );
        }
      }
    }

    try {
      await plugin.install(this.core, options);
      this.installedPlugins.add(pluginName);
      console.info(`[PluginManager] Plugin "${pluginName}" installed successfully`);
    } catch (error) {
      console.error(`[PluginManager] Failed to install plugin "${pluginName}":`, error);
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginName: string): Promise<void> {
    if (!this.core) {
      throw new Error('[PluginManager] Core instance is not set');
    }

    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`[PluginManager] Plugin "${pluginName}" is not registered`);
    }

    if (!this.installedPlugins.has(pluginName)) {
      console.warn(`[PluginManager] Plugin "${pluginName}" is not installed`);
      return;
    }

    // 检查是否有其他插件依赖此插件
    for (const [name, p] of this.plugins.entries()) {
      if (
        this.installedPlugins.has(name) &&
        p.dependencies?.includes(pluginName)
      ) {
        throw new Error(
          `[PluginManager] Cannot uninstall "${pluginName}" because "${name}" depends on it`
        );
      }
    }

    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this.core);
      }
      this.installedPlugins.delete(pluginName);
      console.info(`[PluginManager] Plugin "${pluginName}" uninstalled successfully`);
    } catch (error) {
      console.error(`[PluginManager] Failed to uninstall plugin "${pluginName}":`, error);
      throw error;
    }
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(pluginName: string): boolean {
    return this.installedPlugins.has(pluginName);
  }

  /**
   * 获取所有已注册的插件
   */
  getPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.version,
      installed: this.installedPlugins.has(name),
    }));
  }

  /**
   * 获取所有已安装的插件
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.installedPlugins);
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear();
    this.installedPlugins.clear();
  }
}

/**
 * 创建插件辅助函数
 */
export function createPlugin(config: {
  name: string;
  version?: string;
  dependencies?: string[];
  install: (core: DatePickerCore, options?: any) => void | Promise<void>;
  uninstall?: (core: DatePickerCore) => void | Promise<void>;
}): Plugin {
  return {
    name: config.name,
    version: config.version,
    dependencies: config.dependencies,
    install: config.install,
    uninstall: config.uninstall,
  };
}

