import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import { useDispatch, useSelector } from 'react-redux';
import { USER_LOCKED_ROUTE } from 'config/constants';

// ==============================|| AUTH GUARD ||============================== //

const UserAuthGuard = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);

  const { isLoggedIn, token, user } = userDataStore

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    } else {
      if (user?.is_active === 1) {
        checkUserLocked()
      }
    }
  }, [isLoggedIn, navigate]);

  const location = useLocation();
  //console_log("UserAuthGuard location::::", location);

  const checkUserLocked = async () => {
    const locked = user?.locked
    if (locked === 1) {
      navigate(USER_LOCKED_ROUTE, { replace: true });
    }
  }
  return children;
}

UserAuthGuard.propTypes = {
  children: PropTypes.node
}

export default UserAuthGuard;
