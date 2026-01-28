// action - state management
import { REGISTER, LOGIN, LOGOUT, PAGE_UPDATE_DATA, REFRESH_PAGE_TIMESTAMP } from './actions';

// initial state
export const initialState = {
  pageTimestamp: 0,
};

// ==============================|| AUTH REDUCER ||============================== //

export const setPageData = (data) => ({
  type: PAGE_UPDATE_DATA,
  payload: {...data}
})

export const refreshPageTimestamp = (data) => ({
  type: REFRESH_PAGE_TIMESTAMP,
  payload: { ...data }
})

const pageStore = (state = initialState, action) => {
  switch (action.type) {
   
    case PAGE_UPDATE_DATA: {
      const payload = action.payload;
      return {
        ...state,
        ...payload
      };
    }
    case REFRESH_PAGE_TIMESTAMP: {
      const payload = action.payload;
      return {
        ...state,
        pageTimestamp: new Date().getTime(),
      };
    }
    
    default: {
      return { ...state };
    }
  }
}

export default pageStore;
