// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project import
import authReducer from './auth';
import chat from './chat';
import calendar from './calendar';
import menu from './menu';
import snackbar from './snackbar';
import productReducer from './product';
import cartReducer from './cart';
import kanban from './kanban';
import pageReducer from './page';
import pagePersistReducer from './pagePersist';
import settingPersistReducer from './settingPersist';
import socketReducer from './socket';
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  auth: persistReducer(
    {
      key: 'auth',
      storage,
      keyPrefix: 'gst-ts-'
    },
    authReducer
  ),
  page: pageReducer,
  pagePersist: persistReducer(
    {
      key: 'page-persist',
      storage,
      keyPrefix: 'gst-page-data-'
    },
    pagePersistReducer
  ),
  settingPersist: persistReducer(
    {
      key: 'setting-persist',
      storage,
      keyPrefix: 'gst-setting-data-'
    },
    settingPersistReducer
  ),
  socketDataStore: socketReducer,
  chat,
  calendar,
  menu,
  snackbar,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'mantis-ts-'
    },
    cartReducer
  ),
  product: productReducer,
  kanban
});

export default reducers;
