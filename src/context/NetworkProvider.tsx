import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NetInfo, {
  type NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { AppState, type AppStateStatus } from "react-native";

// ── Types ──────────────────────────────────────────────────────────────────────

export type NetworkStatus = "online" | "offline" | "weak";

export interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: NetInfoStateType;
  status: NetworkStatus;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function deriveStatus(netState: NetInfoState): NetworkStatus {
  if (!netState.isConnected || netState.isInternetReachable === false) {
    return "offline";
  }

  // Flag 2G as "weak" — data may load very slowly
  if (netState.type === NetInfoStateType.cellular) {
    const details = netState.details as { cellularGeneration?: string } | null;
    if (details?.cellularGeneration === "2g") return "weak";
  }

  return "online";
}

function netStateToContextValue(netState: NetInfoState): NetworkContextValue {
  return {
    isConnected:         netState.isConnected ?? false,
    isInternetReachable: netState.isInternetReachable ?? null,
    connectionType:      netState.type,
    status:              deriveStatus(netState),
  };
}

// ── Context ────────────────────────────────────────────────────────────────────

const INITIAL: NetworkContextValue = {
  isConnected:         true,
  isInternetReachable: true,
  connectionType:      NetInfoStateType.unknown,
  status:              "online",
};

const NetworkContext = createContext<NetworkContextValue>(INITIAL);

// ── Provider ───────────────────────────────────────────────────────────────────

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<NetworkContextValue>(INITIAL);
  const isMountedRef = useRef(true);

  const applyState = useCallback((netState: NetInfoState) => {
    if (!isMountedRef.current) return;
    setValue(netStateToContextValue(netState));
  }, []);

  // Listen to live network events
  useEffect(() => {
    isMountedRef.current = true;

    // Fetch real initial state immediately — default (INITIAL) optimistically
    // assumes online so the UI renders without a flash of offline state.
    void NetInfo.fetch().then(applyState);

    const unsubscribe = NetInfo.addEventListener(applyState);

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [applyState]);

  // Re-probe on every app foreground resume in case NetInfo missed an event
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void NetInfo.fetch().then(applyState);
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [applyState]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

// ── Public accessor ────────────────────────────────────────────────────────────

export function useNetworkContext(): NetworkContextValue {
  return useContext(NetworkContext);
}
