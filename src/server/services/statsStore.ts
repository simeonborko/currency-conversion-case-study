import { InMemoryStatsStore } from "./InMemoryStatsStore";
import type { IStatsStore } from "./IStatsStore";

let statsStore: IStatsStore = new InMemoryStatsStore();

export function getStatsStore(): IStatsStore {
  return statsStore;
}

export function setStatsStore(store: IStatsStore): void {
  statsStore = store;
}
