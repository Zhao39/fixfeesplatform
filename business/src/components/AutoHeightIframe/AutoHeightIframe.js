import React, { useState, useEffect } from 'react';

const AutoHeightIframe = (props) => {
    const { src, id = "my-iframe", defaultHeight, title } = props
    const defaultIframeWidth = 1146

    const [iframeHeight, setIframeHeight] = useState(defaultHeight);

    useEffect(() => {
        // const iframe = window.document.getElementById(id);
        // const resizeIframe = () => {
        //     console.log(`iframe:::`, iframe.contentWindow)
        //     if (iframe) {
        //         const newHeight = iframe.contentWindow.document.body.scrollHeight + 'px'
        //         console.log(`newHeight:::`, newHeight)
        //         setIframeHeight(newHeight);
        //     }
        // };

        // // Adjust height when iframe content is loaded
        // iframe.onload = resizeIframe;

        // // Adjust height when window is resized
        // window.addEventListener('resize', resizeIframe);

        // // Clean up listeners
        // return () => {
        //     window.removeEventListener('resize', resizeIframe);
        // };
    }, [src, ]);

    useEffect(() => {
      resetIframeSize()
    }, [])
  
    const resetIframeSize = () => {
      const newIframeWidth = window.document.getElementById(id).offsetWidth
      console.log(`newIframeWidth::`, newIframeWidth)
      let newIframeHeight = defaultHeight * defaultIframeWidth / newIframeWidth
      newIframeHeight = Math.ceil(newIframeHeight)
      console.log(`newIframeHeight`, newIframeHeight)
      setIframeHeight(newIframeHeight)
    }
  
    useEffect(() => {
      const handleWindowResize = () => {
        resetIframeSize()
      };
  
      window.addEventListener('resize', handleWindowResize);
  
      return () => {
        window.removeEventListener('resize', handleWindowResize);
      };
    });

    return (
        <iframe
            id={id}
            src={src}
            allowFullScreen=""
            className="Iframe-iframe-ad8182"
            frameBorder="0"
            scrolling="no"
            style={{ width: '100%', border: 'none', height: `${iframeHeight}px` }}
            title={title}
        />
    );
};

export default AutoHeightIframe;
