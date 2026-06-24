import { useNetworkContext, type NetworkContextValue, type NetworkStatus } from "@/src/context/NetworkProvider";

/** Full network context — isConnected, status, connectionType, etc. */
export function useNetworkStatus(): NetworkContextValue {
  return useNetworkContext();
}

/** Convenience: true when the app has no usable internet connection. */
export function useIsOffline(): boolean {
  const { status } = useNetworkContext();
  return status === "offline";
}

/** True when status is "offline" or "weak" — use to guard data-heavy actions. */
export function useIsNetworkLimited(): boolean {
  const { status } = useNetworkContext();
  return status === "offline" || status === "weak";
}

/** Current network status string only. */
export function useNetworkStatusLabel(): NetworkStatus {
  const { status } = useNetworkContext();
  return status;
}
