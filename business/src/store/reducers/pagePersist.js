// action - state management
import { REGISTER, LOGIN, LOGOUT, PAGE_PERSIST_UPDATE_DATA } from './actions';

// initial state
export const initialState = {};

// ==============================|| AUTH REDUCER ||============================== //

export const setPagePersistData = (data) => ({
  type: PAGE_PERSIST_UPDATE_DATA,
  payload: {...data}
})
 

const pagePersistStore = (state = initialState, action) => {
  switch (action.type) {
   
    case PAGE_PERSIST_UPDATE_DATA: {
      const payload = action.payload;
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

export default pagePersistStore;
