import React, { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_ENABLED, RECAPTCHA_KEY } from 'config/constants';
import { useDispatch } from 'react-redux';
import { getSettingPersist } from 'utils/utils';
import { useTheme } from '@mui/material/styles';

export const RECAPTCHA_DEFAULT_VALUE = "yyyyyyyyyyyyyyyyyyyyyyy"

const CaptchaBox = (props) => {
  const { recaptcha, setRecaptcha, captchaTimestamp, captchaKey = "", defaultShow = true } = props
  const dispatch = useDispatch();
  const theme = useTheme();

  const captchaRef = useRef(null)
  const setCaptchaRef = (ref) => {
    if (ref) {
      captchaRef.current = ref
    }
  }
  const resetCaptcha = () => {
    // maybe set it till after is submitted
    if (captchaRef && captchaRef.current) {
      captchaRef.current.reset();
    }
  }

  useEffect(() => {
    if (RECAPTCHA_ENABLED === "false") {
      setRecaptcha(RECAPTCHA_DEFAULT_VALUE)
    }
  }, [])

  const [captchaEnabled, setCaptchaEnabled] = useState(false)
  const checkCaptchaEnabled = () => {
    const captchaSettingEnabledValue = getSettingPersist(captchaKey, defaultShow)
    console.log("captchaSettingEnabledValue", captchaSettingEnabledValue)
    if (captchaSettingEnabledValue) { // show captcha
      setCaptchaEnabled(true)
      setRecaptcha(RECAPTCHA_ENABLED === 'false' ? RECAPTCHA_DEFAULT_VALUE : "") //recaptcha
      if (window && window.grecaptcha) {
        resetCaptcha()
      }
    }
    else { // don't show captcha
      setCaptchaEnabled(false)
      setRecaptcha(RECAPTCHA_DEFAULT_VALUE)
    }
  }

  useEffect(() => {
    checkCaptchaEnabled(captchaKey)
  }, [captchaKey, captchaTimestamp])

  const onChange = (value) => {
    //console.log("ReCAPTCHA onchange::::", value);
    setRecaptcha(value);
  }

  const onExpired = () => {
    console.log("ReCAPTCHA onExpired::::");
    setRecaptcha(RECAPTCHA_ENABLED === 'false' ? RECAPTCHA_DEFAULT_VALUE : "")
  }

  const recaptchaMode = theme.palette.mode === 'dark' ? 'dark' : 'light'

  return (
    <>
      {
        (RECAPTCHA_ENABLED === "false") ? (
          <></>
        ) : (
          <>
            {
              (captchaEnabled) ? (
                <>
                  <ReCAPTCHA
                    ref={(r) => setCaptchaRef(r)}
                    sitekey={RECAPTCHA_KEY}
                    onChange={onChange}
                    onExpired={onExpired}
                    theme={recaptchaMode}
                  />
                </>
              ) : (
                <></>
              )
            }
          </>
        )
      }
    </>
  );
};

export default CaptchaBox;
