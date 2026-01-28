import { useLocation } from 'react-router';
import StatsPageSettings from 'sections/summary/StatsPageSettings';

const PageSettings = () => {
  //const navigate = useNavigate()
  const location = useLocation();
  const pathname = location.pathname

  return (
    <>
      {
        (pathname === "/user/summary") ? (
          <><StatsPageSettings /></>
        ) : (
          <></>
        )
      }
    </>
  );
};

export default PageSettings;
