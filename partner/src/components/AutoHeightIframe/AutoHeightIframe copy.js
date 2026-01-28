import React, { useState, useEffect } from 'react';

const AutoHeightIframe = (props) => {
    const { src, id = "my-iframe", height = "100vh", title } = props
    const [iframeHeight, setIframeHeight] = useState('0px');

    useEffect(() => {
        const iframe = window.document.getElementById(id);
        const resizeIframe = () => {
            console.log(`iframe:::`, iframe.contentWindow)
            if (iframe) {
                const newHeight = iframe.contentWindow.document.body.scrollHeight + 'px'
                console.log(`newHeight:::`, newHeight)
                setIframeHeight(newHeight);
            }
        };

        // Adjust height when iframe content is loaded
        iframe.onload = resizeIframe;

        // Adjust height when window is resized
        window.addEventListener('resize', resizeIframe);

        // Clean up listeners
        return () => {
            window.removeEventListener('resize', resizeIframe);
        };
    }, [src]);

    return (
        <iframe
            id={id}
            src={src}
            allowFullScreen=""
            className="Iframe-iframe-ad8182"
            frameBorder="0"
            scrolling="no"
            style={{ width: '100%', border: 'none', height: iframeHeight }}
            title={title}
        />
    );
};

export default AutoHeightIframe;
