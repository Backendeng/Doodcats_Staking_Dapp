import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

import { useWeb3React } from "@web3-react/core";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components

// Custom styles for DashboardNavbar
import { navbar, navbarContainer, navbarRow } from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav } from "context";

import connectedIcon from "../../../assets/images/connectedIcon.png";

import { injected } from "../../../utils/connect";
import { switchSongbirdNetwork } from "../../../utils/switch-network";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const { account, chainId, activate, deactivate } = useWeb3React();

  async function connect() {
    if (chainId !== 19 || chainId === undefined) {
      switchSongbirdNetwork();
    }
    try {
      await activate(injected);
      localStorage.setItem("isWalletConnected", true);
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      localStorage.setItem("isWalletConnected", false);
      window.location.reload();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("isWalletConnected") === "true") {
        try {
          await activate(injected);
          localStorage.setItem("isWalletConnected", true);
        } catch (ex) {
          // eslint-disable-next-line no-console
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { navbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            onClick={handleMiniSidenav}
            style={{ background: "rgba(0, 0, 0, 0.1)", borderRadius: "10px" }}
          >
            <Icon sx={iconsStyle} fontSize="medium">
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>
        </MDBox>
        <MDBox
          sx={(theme) => navbarRow(theme, { isMini })}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <MDBox color={light ? "white" : "inherit"}>
            {account ? (
              <MDButton color="success" onClick={() => disconnect()}>
                <img
                  src={connectedIcon}
                  alt="connectedIcon"
                  style={{ width: "30px", paddingRight: "6%" }}
                />
                {account.slice(0, 4)} ..... {account.slice(-4)}
              </MDButton>
            ) : (
              <MDButton color="success" onClick={() => connect()}>
                Connect Wallet
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
