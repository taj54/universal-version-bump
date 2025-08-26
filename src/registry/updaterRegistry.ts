import { UpdaterInterface as IUpdater } from '../interface';

/**
 * Registry for managing updaters.
 */
export class UpdaterRegistry {
  private updaters: Map<string, IUpdater> = new Map();

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
