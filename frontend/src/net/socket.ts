import { WsMessage } from './types';

type MessageHandler = (msg: WsMessage) => void;
type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;

export class SpotterSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: MessageHandler;
  private onStatus: StatusHandler;
  private lastSeq = -1;
  private reconnectAttempt = 0;
  private maxBackoff = 8000;
  private baseDelay = 500;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(onMessage: MessageHandler, onStatus: StatusHandler) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.url = `${proto}://${window.location.host}/ws`;
  }

  connect(): void {
    if (this.disposed) return;
    this.onStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.onStatus('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.seq <= this.lastSeq && msg.type !== 'hello') return; // skip duplicates
        this.lastSeq = msg.seq;
        if (msg.type === 'hello') {
          this.lastSeq = msg.seq; // resync
        }
        this.onMessage(msg);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (!this.disposed) {
        this.onStatus('reconnecting');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.disposed) return;
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempt),
      this.maxBackoff
    );
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.onStatus('disconnected');
  }
}
