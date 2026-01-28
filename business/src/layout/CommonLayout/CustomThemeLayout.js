import "assets/global/css/base.css";
import "assets/global/css/global.css";
import "assets/global/css/custom.css";

import "assets/home/css/custom.css";
import "assets/home/css/desktop.css";
import "assets/home/css/mobile.css";
import "assets/user/css/custom.css";
import "assets/user/css/desktop.css";
import "assets/user/css/mobile.css";

import "assets/admin/css/custom.css";
import "assets/admin/css/desktop.css";
import "assets/admin/css/mobile.css";

import PropTypes from 'prop-types';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import useConfig from 'hooks/useConfig';
import { useThemeSwitcher } from 'react-css-theme-switcher';

const USE_THEME_CHANGE_ANIMATION = false

const CustomThemeLayout = (props) => {
  const { mode, onChangeMode } = useConfig();
  const { switcher, themes, currentTheme, status } = useThemeSwitcher();

  useEffect(() => {
    //console.log("mode:::::", mode)
    switcher({ theme: mode === "light" ? themes.light : themes.dark });
  }, [mode])

  const [pageLoaded, setPageLoaded] = useState(!USE_THEME_CHANGE_ANIMATION ? true : false)
  const pageTimestamp = useSelector((state) => state.page.pageTimestamp);
  useEffect(() => {
    refreshPageLoad()
  }, [pageTimestamp])

  const refreshPageLoad = () => {
    //console.log("refreshPageLoad:::", pageTimestamp)
    if (!USE_THEME_CHANGE_ANIMATION) {
      return false
    }

    const timeoutStep = pageTimestamp > 0 ? 400 : 0
    setPageLoaded(false)
    setTimeout(() => {
      setPageLoaded(true)
    }, timeoutStep)
  }

  return (
    <>
      {
        (pageLoaded) ? (
          <>{props.children}</>
        ) : (
          <></>
        )
      }
    </>
  )
}

export default CustomThemeLayout;
