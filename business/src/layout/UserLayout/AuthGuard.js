import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { console_log, empty } from 'utils/misc';
import { apiGetUserStoreList } from 'services/userStoreService';
import { showToast } from 'utils/utils';

// ==============================|| AUTH GUARD ||============================== //

const STORE_REQUIRED_PATH_LIST = [
  '/user/summary',
  '/user/pixel/all',
  '/user/pixel/ads',
  '/user/pixel/pixel-settings',
  '/user/pixel/tracking-settings',
  '/user/connections/integrations',
]

const UserAuthGuard = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);

  const { isLoggedIn, token, user } = userDataStore

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    } 
  }, [isLoggedIn, navigate]);

  const location = useLocation();
  //console_log("UserAuthGuard location::::", location);
  return children;
};

UserAuthGuard.propTypes = {
  children: PropTypes.node
};

export default UserAuthGuard;
