import { useMemo } from "react";
import type { PackingItem } from "@/types/packing";

export function usePackingProgress(items: PackingItem[]) {
  return useMemo(() => {
    const packed = items.filter((item) => item.packed).length;
    const total = items.length;
    const progress = total === 0 ? 0 : packed / total;

    return { packed, total, progress };
  }, [items]);
}
