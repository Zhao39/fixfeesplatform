// action - state management
import { get_utc_timestamp_ms } from 'utils/misc';
import { REGISTER, LOGIN, UPDATE_AUTH_PROFILE, UPDATE_PROFILE_DATA, UPDATE_PROFILE_TIMESTAMP, LOGOUT } from './actions';

// initial state
export const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  token: "",
  bannerMessage: "",
  userUpdatedTimestamp: 0,
};

// ==============================|| AUTH REDUCER ||============================== //

export const authLogin = (user) => ({
  type: LOGIN,
  payload: { ...user }
})

export const updateAuthProfile = (user) => ({
  type: UPDATE_AUTH_PROFILE,
  payload: { ...user }
})

export const updateProfileData = (profileData) => ({ // profileData = {user: .... , bannerMessage: ....,,,,}
  type: UPDATE_PROFILE_DATA,
  payload: { ...profileData }
})

export const updateProfileTimestamp = () => ({
  type: UPDATE_PROFILE_TIMESTAMP,
  payload: {}
})

export const authLogout = () => ({
  type: LOGOUT,
  payload: {}
})

const auth = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const user = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        token: user.token,
        user
      };
    }
    case UPDATE_AUTH_PROFILE: {
      const user = action.payload;
      return {
        ...state,
        user
      };
    }
    case UPDATE_PROFILE_DATA: {
      const user = action.payload.user;
      const bannerMessage = action.payload.bannerMessage;
      return {
        ...state,
        user,
        bannerMessage
      };
    }
    case UPDATE_PROFILE_TIMESTAMP: {
      return {
        ...state,
        userUpdatedTimestamp: get_utc_timestamp_ms(),
      };
    }
    case LOGOUT: {
      return {
        ...state,
        ...initialState,
        isInitialized: true
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
