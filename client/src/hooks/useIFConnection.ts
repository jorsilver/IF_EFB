import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectionStatus, IFStates, SendCommand } from '../types';

const WS_URL = 'ws://localhost:8080';
const RECONNECT_DELAY_MS = 3000;

export function useIFConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [states, setStates] = useState<IFStates>({});
  const wsRef = useRef<WebSocket | null>(null);

  const sendCommand = useCallback((cmd: SendCommand) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
    }
  }, []);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let active = true;

    function connect() {
      if (!active) return;
      setStatus('connecting');

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (active) setStatus('ws_connected');
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!active) return;
        const msg = JSON.parse(event.data as string) as Record<string, unknown>;

        if (msg.type === 'state') {
          setStates((prev) => ({ ...prev, [msg.key as string]: msg.value }));
        } else if (msg.type === 'snapshot') {
          // Initial burst of all currently-cached IF states
          setStates(msg.states as IFStates);
        } else if (msg.type === 'manifest_ready') {
          setStatus('ready');
        } else if (msg.type === 'if_connected') {
          setStatus('ws_connected');
        } else if (msg.type === 'if_disconnected') {
          setStatus('if_disconnected');
        }
      };

      ws.onclose = () => {
        if (!active) return;
        setStatus('disconnected');
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  return { status, states, sendCommand };
}
