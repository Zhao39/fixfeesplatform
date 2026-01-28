import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project import
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';
import config from 'config';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = (props) => {
  const { reverse, isIcon, sx, to, href, width, src } = props
  return (
    <>
      {
        (href) ? (
          <a className="MuiButtonBase-root css-10d1a0h-MuiButtonBase-root" href={href} rel="noreferrer">
            {isIcon ? <LogoIcon /> : <LogoMain reverse={reverse} width={width} src={src} />}
          </a>
        ) : (
          <ButtonBase disableRipple component={Link} to={!to ? config.defaultPath : to} sx={sx}>
            {isIcon ? <LogoIcon /> : <LogoMain reverse={reverse} width={width} src={src} />}
          </ButtonBase>
        )
      }
    </>
  )
}

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
