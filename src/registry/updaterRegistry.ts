import { UpdaterInterface as IUpdater } from '../interface';
import {
  DockerUpdater,
  GoUpdater,
  NodeUpdater,
  PHPUpdater,
  PythonUpdater,
  RustUpdater,
  CustomUpdater,
} from '../updaters';

/**
 * Registry for managing updaters.
 */
export class UpdaterRegistry {
  private updaters: Map<string, IUpdater> = new Map();

  constructor() {}

  /**
   * Loads and registers all updaters.
   */
  async loadUpdaters(): Promise<void> {
    this.registerUpdater(new DockerUpdater());
    this.registerUpdater(new GoUpdater());
    this.registerUpdater(new NodeUpdater());
    this.registerUpdater(new PHPUpdater());
    this.registerUpdater(new PythonUpdater());
    this.registerUpdater(new RustUpdater());
    this.registerUpdater(new CustomUpdater());
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
