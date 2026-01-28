// material-ui
import { useTheme } from '@mui/material/styles';
import { WEBSITE_VERSION } from 'config/constants';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === 'dark' ? logoIconDark : logoIcon} alt="Mantis" width="100" />
     *
     */
    <>
      <img src={`/assets/global/images/logo-icon.png?v=${WEBSITE_VERSION}`} style={{ width: 32, height: 32 }} alt="logo" />
    </>
  );
};

export default LogoIcon;
