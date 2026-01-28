// material-ui
import { Box, Button, Typography } from '@mui/material';

// third party

// project import
import { Link } from "react-router-dom";

const UnlockVideoSection = (props) => {

  return (
    <Box sx={{p:2}}>
      <div className="">
        <div
          className="front-video-box text-center"
          style={{ position: "relative", zIndex: 1 }}
        >
          <iframe
            src="https://player.vimeo.com/video/888303230"
            className="vimeo-iframe"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="video"
            style={{ margin: 'auto' }}
          ></iframe>
        </div>
      </div>
    </Box>
  )
}

export default UnlockVideoSection;
