/* eslint-disable camelcase */
import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TextField from "@mui/material/TextField";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import Footer from "examples/Footer";
import MDButton from "components/MDButton";

import { notification } from "antd";

// ABI import
import SDOODSTAKINGABI from "../../assets/abi/sdoodstakingABI.json";
import SDOODABI from "../../assets/abi/sdoodABI.json";

// Config
import config from "../../config/config";

import "./sdoodstaking.css";

const ethers = require("ethers");

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

// eslint-disable-next-line no-unused-vars
const timerProps = {
  isPlaying: true,
  size: 55,
  strokeWidth: 2,
};

// eslint-disable-next-line no-unused-vars
const renderTime = (dimension, time) => (
  <div className="time-wrapper">
    <div className="time">{time}</div>
    <div>{dimension}</div>
  </div>
);

// eslint-disable-next-line no-bitwise
const getTimeSeconds = (time) => (minuteSeconds - time) | 0;
// eslint-disable-next-line no-bitwise
const getTimeMinutes = (time) => ((time % hourSeconds) / minuteSeconds) | 0;
// eslint-disable-next-line no-bitwise
const getTimeHours = (time) => ((time % daySeconds) / hourSeconds) | 0;
// eslint-disable-next-line no-bitwise
const getTimeDays = (time) => (time / daySeconds) | 0;

function SDoodStaking() {
  const { account } = useWeb3React();
  const [loadingStake1State, setLoadingStake1State] = useState(false);
  const [loadingStake2State, setLoadingStake2State] = useState(false);
  const [loadingStake3State, setLoadingStake3State] = useState(false);
  const [loadingStake4State, setLoadingStake4State] = useState(false);
  const [loadingClaimState, setLoadingClaimState] = useState(false);

  const [Amount_30, setAmount_30] = useState(0);
  const [Amount_60, setAmount_60] = useState(0);
  const [Amount_90, setAmount_90] = useState(0);
  const [Amount_120, setAmount_120] = useState(0);

  const [daysDuration, setDaysDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const [stakedAmount, setStakedAmount] = useState(0);
  const [earnPercent, setEarnPercent] = useState(0);
  const [stakeState, setStakeState] = useState(false);

  const newProvider = new ethers.providers.Web3Provider(window.ethereum);
  const newSigner = newProvider.getSigner();
  const sdoodContract = new ethers.Contract(config.SDOODADDRESS, SDOODABI, newSigner);

  const sdoodStakingContract = new ethers.Contract(
    config.SDOODSTAKINGADDRESS,
    SDOODSTAKINGABI,
    newSigner
  );

  const inputValue_30 = (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setAmount_30(value);
  };

  const InputValue_60 = (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setAmount_60(value);
  };

  const InputValue_90 = (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setAmount_90(value);
  };

  const InputValue_120 = (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setAmount_120(value);
  };

  // Claim State Function
  const claimState = () => {
    sdoodStakingContract.stakingInfos(account).then((stakeInfo) => {
      const c_stakedDay = Number(stakeInfo.stakingtype.toString()) / 3600 / 24;
      const c_lefttime = Number(stakeInfo.lockdeadline.toString());
      const c_stakedAmount = Number(stakeInfo.amount.toString()) / 10 ** 18;
      setStakedAmount(c_stakedAmount);
      // eslint-disable-next-line no-shadow
      const stratTime = Date.now() / 1000; // use UNIX timestamp in seconds
      // eslint-disable-next-line no-shadow
      const endTime = c_lefttime + c_stakedDay * 3600; // use UNIX timestamp in seconds
      const remainingTimes = endTime - stratTime;
      setRemainingTime(remainingTimes);
      // eslint-disable-next-line no-shadow
      const days = Math.ceil(remainingTimes / daySeconds);
      const daysDurations = days * daySeconds;
      setDaysDuration(daysDurations);
      setStakeState(stakeInfo.isStaked);
      if (c_stakedDay === 30) {
        setEarnPercent(5);
      } else if (c_stakedDay === 60) {
        setEarnPercent(10);
      } else if (c_stakedDay === 90) {
        setEarnPercent(15);
      } else if (c_stakedDay === 120) {
        setEarnPercent(25);
      }
    });
  };

  useEffect(() => {
    if (account) {
      claimState();
    }
  }, [account]);
  // Staking SDOOD Function
  const staking = async (amount, day) => {
    if (amount <= 0) {
      notification.error({
        message: "Error",
        description: "Min Amount is 1 sDOOD.",
      });
    } else {
      if (day === 30) {
        setLoadingStake1State(true);
      } else if (day === 60) {
        setLoadingStake2State(true);
      } else if (day === 90) {
        setLoadingStake3State(true);
      } else if (day === 120) {
        setLoadingStake4State(true);
      }

      const amountValue = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
      await sdoodContract.approve(config.SDOODSTAKINGADDRESS, amountValue).then((txApprove) => {
        txApprove.wait().then(() => {
          sdoodStakingContract
            .staking(amountValue, ethers.BigNumber.from((day * 24 * 3600).toString()), {
              gasLimit: 3000000,
            })
            .then((tx) => {
              tx.wait().then(() => {
                if (day === 30) {
                  setLoadingStake1State(false);
                } else if (day === 60) {
                  setLoadingStake2State(false);
                } else if (day === 90) {
                  setLoadingStake3State(false);
                } else if (day === 120) {
                  setLoadingStake4State(false);
                }
                notification.success({
                  message: "Success",
                  description: "Staking Successful.",
                });
                window.location.reload();
              });
            });
        });
      });
    }
  };
  // Claim SDOOD Function
  const claimStaking = async () => {
    setLoadingClaimState(true);
    await sdoodStakingContract.claimStaking({ gasLimit: 3000000 }).then((tx) => {
      tx.wait().then(() => {
        setLoadingClaimState(false);
        notification.success({
          message: "Success",
          description: "Claim Successful.",
        });
        window.location.reload();
      });
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card className="sdoodStakingContainer">
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  sDOOD STAKING
                </MDTypography>
              </MDBox>
              <MDBox p={6}>
                {!stakeState ? (
                  <Grid container spacing={4} mt={3} mb={3}>
                    <Grid item xs={12} xl={6} md={6} mb={3}>
                      <Card>
                        <MDBox
                          mx={2}
                          mt={-3}
                          py={3}
                          px={2}
                          variant="gradient"
                          bgColor="success"
                          borderRadius="lg"
                          coloredShadow="info"
                        >
                          <MDTypography variant="h6" color="white">
                            STAKING OPTION - A
                          </MDTypography>
                        </MDBox>
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h6" textAlign="center">
                            30 Days Lock period
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            0% Fees apply
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            5% Coin on release
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            Early release fee 3.5%
                          </MDTypography>
                          <TextField
                            style={{ width: "100%", marginTop: "8%" }}
                            id="outlined-number"
                            label="sDood Amount"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={inputValue_30}
                          />
                          {account ? (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              onClick={() => staking(Amount_30, 30)}
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                {loadingStake1State ? (
                                  <CircularProgress
                                    color="inherit"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                ) : (
                                  "STAKING"
                                )}
                              </MDTypography>
                            </MDButton>
                          ) : (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              disabled
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                STAKING
                              </MDTypography>
                            </MDButton>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} xl={6} md={6}>
                      <Card>
                        <MDBox
                          mx={2}
                          mt={-3}
                          py={3}
                          px={2}
                          variant="gradient"
                          bgColor="success"
                          borderRadius="lg"
                          coloredShadow="info"
                        >
                          <MDTypography variant="h6" color="white">
                            STAKING OPTION - B
                          </MDTypography>
                        </MDBox>
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h6" textAlign="center">
                            60 Days Lock period
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            0% Fees apply
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            10% Coin on release
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            Early release fee 3.5%
                          </MDTypography>
                          <TextField
                            style={{ width: "100%", marginTop: "8%" }}
                            id="outlined-number"
                            label="sDOOD Amount"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={InputValue_60}
                          />
                          {account ? (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              onClick={() => staking(Amount_60, 60)}
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                {loadingStake2State ? (
                                  <CircularProgress
                                    color="inherit"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                ) : (
                                  "STAKING"
                                )}
                              </MDTypography>
                            </MDButton>
                          ) : (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              disabled
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                STAKING
                              </MDTypography>
                            </MDButton>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} xl={6} md={6}>
                      <Card>
                        <MDBox
                          mx={2}
                          mt={-3}
                          py={3}
                          px={2}
                          variant="gradient"
                          bgColor="success"
                          borderRadius="lg"
                          coloredShadow="info"
                        >
                          <MDTypography variant="h6" color="white">
                            STAKING OPTION - C
                          </MDTypography>
                        </MDBox>
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h6" textAlign="center">
                            90 Days Lock period
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            0% Fees apply
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            15% Coin on release
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            Early release fee 5.5%
                          </MDTypography>
                          <TextField
                            style={{ width: "100%", marginTop: "8%" }}
                            id="outlined-number"
                            label="sDOOD Amount"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={InputValue_90}
                          />
                          {account ? (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              onClick={() => staking(Amount_90, 90)}
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                {loadingStake3State ? (
                                  <CircularProgress
                                    color="inherit"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                ) : (
                                  "STAKING"
                                )}
                              </MDTypography>
                            </MDButton>
                          ) : (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              disabled
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                STAKING
                              </MDTypography>
                            </MDButton>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} xl={6} md={6} mb={3}>
                      <Card>
                        <MDBox
                          mx={2}
                          mt={-3}
                          py={3}
                          px={2}
                          variant="gradient"
                          bgColor="success"
                          borderRadius="lg"
                          coloredShadow="info"
                        >
                          <MDTypography variant="h6" color="white">
                            STAKING OPTION - D
                          </MDTypography>
                        </MDBox>
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h6" textAlign="center">
                            120 Days Lock period
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            0% Fees apply
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            25% Coin on release
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            Early release fee 5.5%
                          </MDTypography>
                          <TextField
                            style={{ width: "100%", marginTop: "8%" }}
                            id="outlined-number"
                            label="sDOOD Amount"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={InputValue_120}
                          />
                          {account ? (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              onClick={() => staking(Amount_120, 120)}
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                {loadingStake4State ? (
                                  <CircularProgress
                                    color="inherit"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                ) : (
                                  "STAKING"
                                )}
                              </MDTypography>
                            </MDButton>
                          ) : (
                            <MDButton
                              color="success"
                              style={{ width: "100%", marginTop: "8%" }}
                              disabled
                            >
                              <MDTypography variant="h6" textAlign="center" color="white">
                                STAKING
                              </MDTypography>
                            </MDButton>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={4} mt={3} mb={3}>
                    <Grid item xs={12} xl={3} md={3} mb={3} />
                    <Grid item xs={12} xl={5} md={5}>
                      <Card>
                        <MDBox
                          mx={2}
                          mt={-3}
                          py={3}
                          px={2}
                          variant="gradient"
                          bgColor="success"
                          borderRadius="lg"
                          coloredShadow="info"
                        >
                          <MDTypography variant="h6" color="white">
                            CLAIM
                          </MDTypography>
                        </MDBox>
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h6" textAlign="center">
                            Total sDOOD Staked: {stakedAmount} sDOOD
                          </MDTypography>
                          <MDTypography variant="h6" textAlign="center">
                            Day Left to Mature.🕜
                          </MDTypography>
                          <MDBox
                            style={{ width: "100%", display: "flex", justifyContent: "center" }}
                          >
                            <MDBox style={{ paddingRight: "1%" }}>
                              <CountdownCircleTimer
                                {...timerProps}
                                colors="#7E2E84"
                                duration={daysDuration}
                                initialRemainingTime={remainingTime}
                              >
                                {({ elapsedTime, color }) => (
                                  <span style={{ color, fontSize: "15px" }}>
                                    {renderTime("Days", getTimeDays(daysDuration - elapsedTime))}
                                  </span>
                                )}
                              </CountdownCircleTimer>
                            </MDBox>
                            <MDBox style={{ paddingRight: "1%" }}>
                              <CountdownCircleTimer
                                {...timerProps}
                                colors="#D14081"
                                duration={daySeconds}
                                initialRemainingTime={remainingTime % daySeconds}
                                onComplete={(totalElapsedTime) => ({
                                  shouldRepeat: remainingTime - totalElapsedTime > hourSeconds,
                                })}
                              >
                                {({ elapsedTime, color }) => (
                                  <span style={{ color, fontSize: "15px" }}>
                                    {renderTime("Hrs", getTimeHours(daySeconds - elapsedTime))}
                                  </span>
                                )}
                              </CountdownCircleTimer>
                            </MDBox>
                            <MDBox style={{ paddingRight: "1%" }}>
                              <CountdownCircleTimer
                                {...timerProps}
                                colors="#EF798A"
                                duration={hourSeconds}
                                initialRemainingTime={remainingTime % hourSeconds}
                                onComplete={(totalElapsedTime) => ({
                                  shouldRepeat: remainingTime - totalElapsedTime > minuteSeconds,
                                })}
                              >
                                {({ elapsedTime, color }) => (
                                  <span style={{ color, fontSize: "15px" }}>
                                    {renderTime("Mins", getTimeMinutes(hourSeconds - elapsedTime))}
                                  </span>
                                )}
                              </CountdownCircleTimer>
                            </MDBox>
                            <MDBox>
                              <CountdownCircleTimer
                                {...timerProps}
                                colors="#218380"
                                duration={minuteSeconds}
                                initialRemainingTime={remainingTime % minuteSeconds}
                                onComplete={(totalElapsedTime) => ({
                                  shouldRepeat: remainingTime - totalElapsedTime > 0,
                                })}
                              >
                                {({ elapsedTime, color }) => (
                                  <span style={{ color, fontSize: "15px" }}>
                                    {renderTime("Secs", getTimeSeconds(elapsedTime))}
                                  </span>
                                )}
                              </CountdownCircleTimer>
                            </MDBox>
                          </MDBox>
                          <MDTypography variant="h6" textAlign="center">
                            Earning: {earnPercent} %
                          </MDTypography>
                          <MDButton
                            color="success"
                            style={{ width: "100%", marginTop: "8%" }}
                            onClick={() => claimStaking()}
                          >
                            {loadingClaimState ? (
                              <CircularProgress
                                color="inherit"
                                style={{ width: "20px", height: "20px" }}
                              />
                            ) : (
                              "CLAIM"
                            )}
                          </MDButton>
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} xl={3} md={3} />
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SDoodStaking;
