import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

let httpServer = null;

export const startWebSocketServer = (wsClients) => {
    if (httpServer) {
        console.log('Client already connected');
        return;
    }
    
    httpServer = createServer();
    
    const wss = new WebSocketServer({ server: httpServer });
    
    wss.on('connection', (client) => {
        console.log('Client connected');
        wsClients.add(client);
        
        client.on('close', () => {
            console.log('Client disconnected');
            wsClients.delete(client);
        })
        
        client.on('error', (error) => {
            console.error('Websocket error: ', error);
            wsClients.delete(client);
        })
    });
    
    const WSS_PORT = process.env.WSS_PORT || 3001;     
    httpServer.listen(WSS_PORT, () => console.log(`WSS Online on ws://localhost:${WSS_PORT}`));
}