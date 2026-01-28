import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import config from 'config';

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard = ({ children }) => {
  const navigate = useNavigate();
  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
