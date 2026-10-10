import { io } from 'socket.io-client';
import { API_URL as BASE_URL } from '@env';

const socket = io(BASE_URL, {
  transports: ['websocket'], // important for React Native
  jsonp: false,
});

export default socket;