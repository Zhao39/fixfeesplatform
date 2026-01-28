// project import
import { useEffect, useState } from 'react';

//this contains loading animation

const RoutePageWrapper = (props) => {
  const [pageLoaded, setPageLoaded] = useState(false)
  
  useEffect(() => {
    setPageLoaded(true)
  }, [])

  return (
    <div className={`router-page-wrapper opacity-0 ${pageLoaded ? 'fadeIn' : ''}`} style={{ width: '100%' }}>
      {props.children}
    </div>
  )
}

export default RoutePageWrapper;
