import { useState } from "react";
import { useWeb3React } from "@web3-react/core";

import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CircularProgress from "@mui/material/CircularProgress";

import "antd/dist/antd.min.css";
import { notification } from "antd";
// eslint-disable-next-line import/no-extraneous-dependencies
import "./dednftstaking.css";

import SDOODABI from "../../assets/abi/sdoodABI.json";
import DEDNFTSTAKINGABI from "../../assets/abi/dednftStakingABI.json";

import config from "../../config/config";

const ethers = require("ethers");

// eslint-disable-next-line react/prop-types
function NFTCard({ tokenID, isStaked, balance, src, level }) {
  const { account } = useWeb3React();

  // Get Contract Data
  const stakingProvider = new ethers.providers.Web3Provider(window.ethereum);
  const stakingSigner = stakingProvider.getSigner();
  const sdoodContract = new ethers.Contract(config.SDOODADDRESS, SDOODABI, stakingSigner);
  const stakingContract = new ethers.Contract(
    config.DEDNFTSTAKINGADDRESS,
    DEDNFTSTAKINGABI,
    stakingSigner
  );

  const [stakeLoadingState, setStakeLoadingState] = useState(false);
  const [unstakeLoadingState, setUnStakeLoadingState] = useState(false);
  const [upgradeLoadingState, setUpgradeLoadingState] = useState(false);
  const [upgradeMaxLoadingState, setUpgradeMaxLoadingState] = useState(false);
  const upgradeLevelBurnAmount = [900, 1350, 1800, 2250];
  const upgradeLevelMaxBurnAmount = [6300, 5400, 4050, 2250];

  // Stack Function
  const stackFunc = async () => {
    setStakeLoadingState(true);
    const nftIDArray = [tokenID];
    await stakingContract.stake(nftIDArray, { gasLimit: 300000 }).then((tx) => {
      tx.wait().then(() => {
        notification.success({
          message: "Success",
          description: "Staked Successful.😉",
        });
        setStakeLoadingState(false);
        window.location.reload();
      });
    });
  };

  // UnStake Function
  const unstakeFunc = async () => {
    setUnStakeLoadingState(true);
    const nftIDArray = [tokenID];
    await stakingContract.unStake(nftIDArray, { gasLimit: 300000 }).then((tx) => {
      tx.wait().then(() => {
        notification.success({
          message: "Success",
          description: "UnStaked Successful.😉",
        });
        setUnStakeLoadingState(false);
        window.location.reload();
      });
    });
  };

  // Upgrade Function
  const upgrade = async () => {
    // eslint-disable-next-line no-unused-vars
    let sdoodBalance;
    if (Number(level) > 3) {
      notification.error({
        message: "Error",
        description: "Cannot Upgrade (Max Level)",
      });
    } else {
      const amountValue = ethers.BigNumber.from(upgradeLevelBurnAmount[level]).mul(
        ethers.BigNumber.from(10).pow(18)
      );
      await sdoodContract.balanceOf(account).then((amount) => {
        const unrounded = ethers.utils.formatEther(amount.toString());
        sdoodBalance = parseFloat(unrounded).toFixed(2);
      });
      // need to check the sdood amount in this function
      if (amountValue > sdoodContract.balanceOf(sdoodBalance)) {
        notification.error({
          message: "Error",
          description: "Cannot Upgrade (not enough token)",
        });
      } else {
        setUpgradeLoadingState(true);
        await sdoodContract
          .approve(config.DEDNFTSTAKINGADDRESS, amountValue, { gasLimit: 300000 })
          .then((tx) => {
            tx.wait().then(() => {
              stakingContract.UpgradeLevel(tokenID, { gasLimit: 350000 }).then((tx2) => {
                tx2.wait().then(() => {
                  notification.success({
                    message: "Success",
                    description: "Upgrade Successful.😉",
                  });
                  setUpgradeLoadingState(false);
                  window.location.reload();
                });
              });
            });
          });
      }
    }
  };

  const upgradeMax = async () => {
    // eslint-disable-next-line no-unused-vars
    let sdoodBalance;
    if (Number(level) > 3) {
      notification.error({
        message: "Error",
        description: "Cannot Upgrade (Max Level)",
      });
    } else {
      const amountValue = ethers.BigNumber.from(upgradeLevelMaxBurnAmount[level]).mul(
        ethers.BigNumber.from(10).pow(18)
      );
      await sdoodContract.balanceOf(account).then((amount) => {
        const unrounded = ethers.utils.formatEther(amount.toString());
        sdoodBalance = parseFloat(unrounded).toFixed(2);
      });
      // need to check the sdood amount in this function
      if (amountValue > sdoodContract.balanceOf(sdoodBalance)) {
        notification.error({
          message: "Error",
          description: "Not Enough SDOOD!",
        });
      } else {
        setUpgradeMaxLoadingState(true);
        await sdoodContract
          .approve(config.DEDNFTSTAKINGADDRESS, amountValue, { gasLimit: 300000 })
          .then((tx1) => {
            tx1.wait().then(() => {
              stakingContract.UpgradeLevelMax(tokenID, { gasLimit: 350000 }).then((tx2) => {
                tx2.wait().then(() => {
                  notification.success({
                    message: "Success",
                    description: "UpgradeMax Successful.😉",
                  });
                  setUpgradeMaxLoadingState(false);
                  window.location.reload();
                });
              });
            });
          });
      }
    }
  };

  if (isStaked) {
    return (
      <Card>
        <MDBox mx={2} mt={-7} px={2}>
          <img src={src} alt="" style={{ width: "100%", borderRadius: "10px" }} />
        </MDBox>
        <MDBox pt={3} ml={3} mr={3} mb={3}>
          <MDTypography variant="h5" textAlign="center" mb={1}>
            TOKENID : #{tokenID}
          </MDTypography>
          <MDTypography variant="h5" textAlign="center" mb={1}>
            LEVEL : {level}
          </MDTypography>
          <MDTypography variant="h5" textAlign="center" mb={1}>
            BALANCE : {balance}
          </MDTypography>
          <MDButton
            color="black"
            style={{ width: "100%", marginBottom: "4%" }}
            onClick={() => {
              unstakeFunc();
            }}
          >
            <MDTypography variant="h6" textAlign="center" color="white">
              {unstakeLoadingState ? (
                <CircularProgress color="inherit" style={{ width: "20px", height: "20px" }} />
              ) : (
                "UNSTAKE"
              )}
            </MDTypography>
          </MDButton>
          <MDButton
            color="success"
            style={{ width: "100%", marginBottom: "4%" }}
            onClick={() => {
              upgrade();
            }}
          >
            <MDTypography variant="h6" textAlign="center" color="white">
              {upgradeLoadingState ? (
                <CircularProgress color="inherit" style={{ width: "20px", height: "20px" }} />
              ) : (
                "UPGRADE"
              )}
            </MDTypography>
          </MDButton>
          <MDButton
            color="success"
            style={{ width: "100%", marginBottom: "4%" }}
            onClick={() => {
              upgradeMax();
            }}
          >
            <MDTypography variant="h6" textAlign="center" color="white">
              {upgradeMaxLoadingState ? (
                <CircularProgress color="inherit" style={{ width: "20px", height: "20px" }} />
              ) : (
                "UPGRADEMAX"
              )}
            </MDTypography>
          </MDButton>
        </MDBox>
      </Card>
    );
  }
  return (
    <Card>
      <MDBox mx={2} mt={-7} px={2}>
        <img src={src} alt="" style={{ width: "100%", borderRadius: "10px" }} />
      </MDBox>
      <MDBox pt={3} ml={3} mr={3} mb={3}>
        <MDTypography variant="h5" textAlign="center" mb={1}>
          TOKENID : #{tokenID}
        </MDTypography>
        <MDButton
          color="success"
          style={{ width: "100%" }}
          onClick={() => {
            stackFunc();
          }}
        >
          <MDTypography variant="h6" textAlign="center" color="white">
            {stakeLoadingState ? (
              <CircularProgress color="inherit" style={{ width: "20px", height: "20px" }} />
            ) : (
              "STAKE"
            )}
          </MDTypography>
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default NFTCard;
