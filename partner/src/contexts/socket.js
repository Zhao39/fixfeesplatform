import { createContext, useEffect, useReducer } from 'react';
import { SOCKET_SERVER_URL } from "config/constants";
import io from "socket.io-client";

export const socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] }); //const socket = io(SOCKET_SERVER_URL); //const socket = io(SOCKET_SERVER_URL, { transports: ['polling'] }); //const socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
export const SocketContext = createContext();