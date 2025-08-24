import { UpdaterInterface as IUpdater } from '../interface';

export class UpdaterRegistry {
  private updaters: Map<string, IUpdater> = new Map();

  registerUpdater(updater: IUpdater): void {
    this.updaters.set(updater.platform, updater);
  }

  getUpdater(platform: string): IUpdater | undefined {
    return this.updaters.get(platform);
  }

  getAllUpdaters(): IUpdater[] {
    return Array.from(this.updaters.values());
  }
}
