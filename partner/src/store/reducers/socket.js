// action - state management
import { REGISTER, LOGIN, LOGOUT, UPDATE_SOCKET } from './actions';

// initial state
const initialState = { socket: null };

// ==============================|| socket REDUCER ||============================== //

export const updateSocket = (socketObj) => ({
  type: UPDATE_SOCKET,
  payload: { ...socketObj }
})

const socketStore = (state = initialState, action) => {
  switch (action.type) {

    case UPDATE_SOCKET: {
      const payload = action.payload;
      //console.log("payload:::::::::::", payload)
      return {
        ...state,
        ...payload
      };
    }

    default: {
      return { ...state };
    }
  }
}

export default socketStore;
