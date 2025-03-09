export abstract class SessionRepositoryPort {
  abstract registerClient(userId: number, socketId: string): Promise<void>;
  abstract unregisterClient(userId: number): Promise<void>;
  abstract getClientSocketId(userId: number): Promise<string | null>;
  abstract getConnectedClients(): Promise<string[]>;
}
