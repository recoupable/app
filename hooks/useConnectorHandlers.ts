import { useState } from "react";

interface UseConnectorHandlersProps {
  slug: string;
  connectedAccountId?: string;
  onConnect: (slug: string) => Promise<string | null>;
  onDisconnect: (connectedAccountId: string) => Promise<boolean>;
}

interface UseConnectorHandlersReturn {
  isConnecting: boolean;
  isDisconnecting: boolean;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
}

/**
 * Hook for managing connector connect/disconnect state and handlers.
 *
 * @param root0
 * @param root0.slug
 * @param root0.connectedAccountId
 * @param root0.onConnect
 * @param root0.onDisconnect
 */
export function useConnectorHandlers({
  slug,
  connectedAccountId,
  onConnect,
  onDisconnect,
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
      await onDisconnect(connectedAccountId);
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
