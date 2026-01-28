// action - state management
import { SETTING_RESET_DATA, SETTING_UPDATE_DATA } from './actions';


// initial state
export const initialState = {
  currentStore: "",
  currentDateRange: {
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(), // new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).getTime(),
    endDate: new Date().getTime(),
    key: 'selection',
  },
  adsTableFormData: null,
  summaryBlockData: null
};

// ==============================|| AUTH REDUCER ||============================== //

export const setSettingData = (data) => ({
  type: SETTING_UPDATE_DATA,
  payload: { ...data }
})

export const resetSettingData = () => ({
  type: SETTING_RESET_DATA,
  payload: {...initialState}
})


const settingPersistStore = (state = initialState, action) => {
  switch (action.type) {

    case SETTING_UPDATE_DATA: {
      const payload = action.payload;
      return {
        ...state,
        ...payload
      };
    }

    case SETTING_RESET_DATA: {
      return {
        ...initialState
      };
    }

    default: {
      return { ...state };
    }
  }
}

export default settingPersistStore;
