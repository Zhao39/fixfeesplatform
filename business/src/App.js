// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import toast, { Toaster } from 'react-hot-toast';
import { SocketContext, socket } from 'contexts/socket';

import 'react-image-lightbox/style.css';

// auth provider
import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
import { Provider } from 'react-redux';
import { store, persister } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import axios from 'axios';
import { console_log } from 'utils/misc';
import WebPageFooter from 'WebPageFooter';
import PagePreloading from 'components/PagePreloading';
import config from './config';
import useConfig from 'hooks/useConfig';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import { WEBSITE_VERSION } from 'config/constants';
import ScrollToTopIcon from 'ScrollToTopIcon';


store.subscribe(listener);

function select(state) {
  //console_log("state:::", state)
  if (state.auth == undefined) {
    return ""
  }
  const { token } = state.auth;

  if (token === undefined || token === null || token === "") return "";
  return token;
}

function listener() {
  let token = select(store.getState());

  axios.defaults.headers.common["Content-Type"] =
    "application/json; charset=UTF-8";
  if (token === "") {

    delete axios.defaults.headers.common["Authorization"];
  } else {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }
}

const themes = {
  light: `/assets/global/css/custom-light.css?v=${WEBSITE_VERSION}`,
  dark: `/assets/global/css/custom-dark.css?v=${WEBSITE_VERSION}`,
};

const App = () => {
  const { mode } = useConfig();   //const themeMode = config.mode

  return (
    <ThemeSwitcherProvider defaultTheme={mode} themeMap={themes} insertionPoint="inject-styles-here">
      <SocketContext.Provider value={socket}>
        <ThemeCustomization>
          <RTLLayout>
            <Locales>
              <ScrollTop>
                <>
                  <Provider store={store}>
                    <PersistGate persistor={persister} loading={null}>
                      <>
                        <PagePreloading mode={`${mode}`} />

                        <Routes />
                        <Snackbar />

                        <Toaster
                          position="top-center"
                          toastOptions={{
                            className: '',
                            style: {
                              //border: '1px solid #713200',
                              backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                              color: mode === 'light' ? '#1e1e1e' : '#ffffff',
                              //padding: '16px',
                            },
                          }}
                        />

                        <ScrollToTopIcon />
                        <WebPageFooter />
                      </>
                    </PersistGate>
                  </Provider>
                </>
              </ScrollTop>
            </Locales>
          </RTLLayout>
        </ThemeCustomization>
      </SocketContext.Provider>
    </ThemeSwitcherProvider>

  )
}

export default App;
