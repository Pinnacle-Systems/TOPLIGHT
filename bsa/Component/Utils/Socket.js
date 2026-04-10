import { io } from 'socket.io-client';
import { BASE_URL } from '../../constants/apiUrl';

const socket = io(BASE_URL, {
  transports: ['websocket'], // important for React Native
  jsonp: false,
});

export default socket;