
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);

      this.socket.on('connect', () => {
        console.log('Conectado ao servidor WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado do servidor WebSocket');
      });

      this.socket.on('error', (error) => {
        console.error('Erro na conexão WebSocket:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
  }

  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }
}

const socketService = new SocketService();

export default socketService;
export { socketService };
