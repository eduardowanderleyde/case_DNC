import { socketService } from '../../services/socket';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('SocketService', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    io.mockReturnValue(mockSocket);
    socketService.socket = null; // Reset socket before each test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve conectar ao servidor WebSocket', () => {
    socketService.connect();
    expect(io).toHaveBeenCalledWith('http://localhost:3001');
  });

  it('deve registrar listeners de eventos', () => {
    const callback = jest.fn();
    socketService.connect(); // Garante que o socket está conectado
    socketService.on('test:event', callback);
    
    expect(mockSocket.on).toHaveBeenCalledWith('test:event', callback);
  });

  it('deve remover listeners de eventos', () => {
    const callback = jest.fn();
    socketService.connect(); // Garante que o socket está conectado
    socketService.on('test:event', callback);
    socketService.off('test:event');
    
    expect(mockSocket.off).toHaveBeenCalledWith('test:event', callback);
  });

  it('deve emitir eventos', () => {
    const data = { test: 'data' };
    socketService.connect(); // Garante que o socket está conectado
    socketService.emit('test:event', data);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('test:event', data);
  });

  it('deve desconectar do servidor', () => {
    socketService.connect(); // Garante que o socket está conectado
    socketService.disconnect();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
}); 