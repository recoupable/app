import { useState } from "react";

interface UseConnectorHandlersProps {
  slug: string;
  connectedAccountId?: string;
  onConnect: (slug: string) => Promise<string | null>;
  onDisconnect: (connectedAccountId: string) => Promise<boolean>;
  onDisconnectSuccess?: () => void;
}

interface UseConnectorHandlersReturn {
  isConnecting: boolean;
  isDisconnecting: boolean;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
}

/**
 * Hook for managing connector connect/disconnect state and handlers.
 */
export function useConnectorHandlers({
  slug,
  connectedAccountId,
  onConnect,
  onDisconnect,
  onDisconnectSuccess,
}: UseConnectorHandlersProps): UseConnectorHandlersReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUrl = await onConnect(slug);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedAccountId) return;

    setIsDisconnecting(true);
    try {
      const ok = await onDisconnect(connectedAccountId);
      if (ok) onDisconnectSuccess?.();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return {
    isConnecting,
    isDisconnecting,
    handleConnect,
    handleDisconnect,
  };
}
