import { storeContext as StoreContext } from "@/store/use-store";
import { rootStore } from "@/store/index";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
}
