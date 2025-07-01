export class LruCache<T> {

  private values: Map<string, T> = new Map<string, T>();
  private maxEntries: number = 256;

  public get(key: string, defaultValue?: T): T | null {
    const hasKey = this.values.has(key);
    if (hasKey) {
      // peek the entry, re-insert for LRU strategy
      const entry = this.values.get(key)!;
      this.values.delete(key);
      this.values.set(key, entry);
      return entry;
    }

    return defaultValue ?? null;
  }

  public put(key: string, value: T) {
    if (this.values.size >= this.maxEntries) {
      // least-recently used cache eviction strategy
      const keyToDelete = this.values.keys().next().value!;

      this.values.delete(keyToDelete);
    }

    this.values.set(key, value);
  }

  public delete(key :string): boolean {
    return this.values.delete(key);
  }

}