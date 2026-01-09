import { describe, it, expect, beforeEach, vi } from "vitest";
import { startWebSocketServer, stopWebSocketServer } from "../../../src/internal/server/startWebSocket.ts";

describe('startWebSocketServer', () => {
    let socket;

    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
        stopWebSocketServer();
    })

    it('Should start a WebSocket server', async () => {
        let wsClients = new Set();

        startWebSocketServer(wsClients);
        socket = new WebSocket('ws://localhost:3001');

        await new Promise((resolve, reject) => {
            socket.onopen = () => resolve();
            socket.onerror = () => reject();
        })

        expect(socket.readyState).toEqual(WebSocket.OPEN);
    });
});