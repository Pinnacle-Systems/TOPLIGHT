import { Server } from 'socket.io';

/**
 * socket.handler.js
 *
 * Central Socket.IO initialization and real-time event router.
 * Handles WebRTC peer signaling, push notifications, and request/approval broadcasts.
 */
export function initializeSocket(server) {
  const peers = {};

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (client) => {
    // ── WebRTC Signaling & Room Management ───────────────────────────────────
    client.on('join', (roomId) => {
      client.join(roomId);
      peers[client.id] = roomId;
      console.log(`[Socket] User ${client.id} joined room ${roomId}`);
      client.to(roomId).emit('user-connected', client.id);
    });

    client.on('ice-candidate', (candidate, targetId) => {
      client.to(targetId).emit('ice-candidate', candidate, client.id);
    });

    client.on('offer', (offer, targetId, to) => {
      client.to(targetId).emit('offer' + to?.group, offer, client.id);
    });

    client.on('answer', (answer, targetId) => {
      client.to(targetId).emit('answer', answer, client.id);
    });

    client.on('disconnect', () => {
      const roomId = peers[client.id];
      if (roomId) {
        client.to(roomId).emit('user-disconnected', client.id);
        delete peers[client.id];
      }
      console.log('[Socket] Client disconnected:', client.id);
    });

    // ── Permission Requests ──────────────────────────────────────────────────
    client.on('permission_request', (data) => {
      client.broadcast.emit(`get_Notifi_permission_id:${data.compcode}${data.hod}`, { data });
    });

    // ── Group Messages ───────────────────────────────────────────────────────
    client.on('message_request', (data) => {
      client.broadcast.emit(`get_message:${data.groupId}${data?.COMPCODE}`, { data });
    });

    // ── Live Location Updates ────────────────────────────────────────────────
    client.on('locationUpdate', (data) => {
      console.log('[Socket] Location update received:', data);
    });

    // ── On-Duty Requests & Approvals ─────────────────────────────────────────
    client.on('onduty_request', (data) => {
      client.broadcast.emit(`get_Notifi_onduty_id:${data.compcode}${data.hod}`, { data });
    });

    client.on('onduty_Approval_Response', (data) => {
      client.broadcast.emit(`get_Onduty_Approval_status:${data.compcode}${data.Idcard}`, { data });
    });

    // ── Leave Requests & Approvals ───────────────────────────────────────────
    client.on('leave_request', (data) => {
      client.broadcast.emit(`get_Notifi_leave_id:${data.compcode}${data.hod}`, { data });
    });

    client.on('leave_Approval_Response', (data) => {
      client.broadcast.emit(`get_leave_Approval_Notifi:${data.compcode}${data.Idcard}`, { data });
    });

    // ── Generic Approval Response ───────────────────────────────────────────
    client.on('Approval_Response', (data) => {
      client.broadcast.emit(`get_Approval_Notifi:${data.compcode}${data.Idcard}`, { data });
    });
  });

  return io;
}

export default initializeSocket;

