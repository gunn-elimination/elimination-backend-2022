import * as io from "socket.io";
import SocketServer from "./SocketServer";
export class SocketEventManagerBase {
  static self: SocketEventManagerBase;
  constructor() {
    SocketEventManagerBase.self = this;
  }
  static getInstance() {
    return SocketEventManagerBase.self || new SocketEventManagerBase();
  }
  broadcastEvent(roomID: string, event: string, data: any) {
    this.onEvent(roomID, event, data);
    // Replace with custom implementer for sharded version.
  }
  onEvent(roomID: string, event: string, data: any) {
    SocketServer.self.socketServer.to(roomID).emit(event, data);
  }
  init(){
    //TODO setup pubsub here
  }
}
// SocketServer.self.socketServer.to('').emit('', '');
export const SocketEventManager = new SocketEventManagerBase();
export default SocketEventManager;