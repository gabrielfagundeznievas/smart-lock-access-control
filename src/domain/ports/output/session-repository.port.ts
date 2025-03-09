export interface SessionRepositoryPort {
  registerClient(userId: number, socketId: string): Promise<void>;

  unregisterClient(userId: number): Promise<void>;

  getClientSocketId(userId: number): Promise<string | null>;

  getConnectedClients(): Promise<string[]>;
}