import axios from 'axios';

const axiosServices = axios.create();

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Axios Error:', error);
    return Promise.reject((error.response && error.response.data) || 'Wrong Services')
  }
);

export default axiosServices;
