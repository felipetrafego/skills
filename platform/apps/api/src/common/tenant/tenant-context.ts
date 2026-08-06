import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantStore {
  /** Slug do tenant resolvido a partir do request (undefined = marketplace público). */
  tenantSlug?: string;
  tenantId?: string;
}

const storage = new AsyncLocalStorage<TenantStore>();

export const TenantContext = {
  run<T>(store: TenantStore, fn: () => T): T {
    return storage.run(store, fn);
  },
  get(): TenantStore {
    return storage.getStore() ?? {};
  },
  set(patch: Partial<TenantStore>): void {
    Object.assign(storage.getStore() ?? {}, patch);
  },
};
