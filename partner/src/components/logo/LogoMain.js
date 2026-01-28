import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { WEBSITE_VERSION } from 'config/constants';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, width, src }) => {
  const theme = useTheme();
  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Mantis" width="100" />
     *
     */
    <>
      <img src={src ? `${src}?v=${WEBSITE_VERSION}` : `/assets/global/images/logo.png?v=${WEBSITE_VERSION}`} style={{ width: width ?? 180, maxWidth: '100%', height: 'auto' }} alt="logo" />
    </>
  );
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
