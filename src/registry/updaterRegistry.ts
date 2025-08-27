import { UpdaterInterface as IUpdater } from '../interface';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Registry for managing updaters.
 */
export class UpdaterRegistry {
  private updaters: Map<string, IUpdater> = new Map();

  /**
   * Dynamically loads and registers all updaters from the updaters directory.
   */
  async loadUpdaters(): Promise<void> {
    const updatersPath = path.join(__dirname, '../updaters');
    const files = fs.readdirSync(updatersPath);

    for (const file of files) {
      if (file.endsWith('Updater.ts')) {
        const modulePath = path.join(updatersPath, file);
        const module = await import(modulePath);
        for (const key in module) {
          if (
            typeof module[key] === 'function' &&
            typeof module[key].prototype.canHandle === 'function'
          ) {
            const updater = new module[key]();
            this.registerUpdater(updater);
          }
        }
      }
    }
  }

  /**
   * Registers a new updater.
   * @param updater The updater to register.
   */
  registerUpdater(updater: IUpdater): void {
    this.updaters.set(updater.platform, updater);
  }

  /**
   * Gets the updater for the specified platform.
   * @param platform The platform to get the updater for.
   * @returns The updater for the specified platform or undefined if not found.
   */
  getUpdater(platform: string): IUpdater | undefined {
    return this.updaters.get(platform);
  }

  /**
   * Gets all registered updaters.
   * @returns An array of all registered updaters.
   */
  getAllUpdaters(): IUpdater[] {
    return Array.from(this.updaters.values());
  }
}
