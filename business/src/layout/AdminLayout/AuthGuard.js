import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import { useDispatch, useSelector } from 'react-redux';

// ==============================|| AUTH GUARD ||============================== //

const AdminAuthGuard = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  //console_log("AdminAuthGuard userDataStore::::", userDataStore)
  const { isLoggedIn, token, user } = userDataStore

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    } else {
     
    }
  }, [isLoggedIn, navigate]);

  const location = useLocation();
  return children;
};

AdminAuthGuard.propTypes = {
  children: PropTypes.node
};

export default AdminAuthGuard;
