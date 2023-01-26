/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import Grid from "@mui/material/Grid";

import { notification } from "antd";
// eslint-disable-next-line import/no-extraneous-dependencies
import { FrownOutlined } from "@ant-design/icons";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
//  Customize the DoodNftStaking CSS
import "./dednftstaking.css";

import dedCardIMG from "../../assets/images/dedCardIMG.png";
// Contract ABI
import DEDNFTABI from "../../assets/abi/dednftABI.json";
import SDOODABI from "../../assets/abi/sdoodABI.json";
import DEDNFTSTAKINGABI from "../../assets/abi/dednftStakingABI.json";

import config from "../../config/config";

import NFTCard from "./dednftcard";

const ethers = require("ethers");

function DedNftStaking() {
  const { account } = useWeb3React();

  // Get Contract Data
  const stakingProvider = new ethers.providers.Web3Provider(window.ethereum);
  const stakingSigner = stakingProvider.getSigner();
  const usernftContract = new ethers.Contract(config.DEDNFTADDRESS, DEDNFTABI, stakingSigner);
  const sdoodContract = new ethers.Contract(config.SDOODADDRESS, SDOODABI, stakingSigner);
  const stakingContract = new ethers.Contract(
    config.DEDNFTSTAKINGADDRESS,
    DEDNFTSTAKINGABI,
    stakingSigner
  );

  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [stakedState, setStakedState] = useState(false);
  const [unstakedState, setUnStakedState] = useState(false);
  const [unstakedNFTs, setUnStakedNFTs] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [sdoodAmount, setSDooDAmount] = useState(0);
  const [approveNFTState, setApprovalNFT] = useState(false);

  const [loadingState, setLoadingState] = useState(false);
  const [stakeAllLoadingState, setStakeAllLoadingState] = useState(false);
  const [unstakeAllLoadingState, setUnStakeAllLoadingState] = useState(false);
  const [harvestAllLoadingState, setHarvestAllLoadingState] = useState(false);

  // Get Stake Data
  const getStakeData = async () => {
    const stakedNFTArray = [];
    const unstakedNFTArray = [];
    setLoadingState(true);

    const approveState = localStorage.getItem("approve_token1");
    if (approveState !== null) {
      setApprovalNFT(true);
    }
    await stakingContract.getStakedNFTList(account).then(async (data) => {
      if (data.length > 0) {
        setStakedState(true);
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await stakingContract.stakedNFTs(Number(data[i].toString())).then((stakeInfo) => {
          stakingContract.calculateRewardsNFT(Number(data[i])).then((totalreward) => {
            const unrounded = ethers.utils.formatEther(totalreward.toString());
            const total = parseFloat(unrounded).toFixed(2);
            stakedNFTArray.push({
              tokenId: Number(data[i]).toString(),
              balance: total,
              level: Number(stakeInfo.level).toString(),
              src: `${config.dedbaseURI}/${data[i].toString()}.png`,
              isStaked: true,
            });
          });
        });
      }
    });

    await usernftContract.walletOfOwner(account).then(async (data) => {
      if (data.length > 0) {
        setUnStakedState(true);
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await stakingContract.stakedNFTs(Number(data[i].toString())).then((stakeInfo) => {
          if (!stakeInfo.isStaked) {
            unstakedNFTArray.push({
              tokenId: Number(data[i].toString()),
              isStaked: false,
              src: `${config.dedbaseURI}/${data[i].toString()}.png`,
            });
          }
        });
      }
    });

    // Balance of SDOOD
    await sdoodContract.balanceOf(account).then((balance) => {
      const unrounded = ethers.utils.formatEther(balance.toString());
      const amountSDOOD = parseFloat(unrounded).toFixed(2);
      setSDooDAmount(amountSDOOD);
    });

    // Balance of NFTs
    await stakingContract.getTotalrewards(account).then((balance) => {
      const unrounded = ethers.utils.formatEther(balance.toString());
      const amount = parseFloat(unrounded).toFixed(2);
      setTotalBalance(amount);
    });

    setStakedNFTs(stakedNFTArray);
    setUnStakedNFTs(unstakedNFTArray);
    // Sort NFTs
    unstakedNFTs.sort((a, b) => a.tokenId - b.tokenId);
    stakedNFTs.sort((a, b) => a.tokenId - b.tokenId);

    setLoadingState(false);
  };

  // StakeAll Fuction
  const stakeAllFunc = async () => {
    setStakeAllLoadingState(true);
    const nftIDArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < unstakedNFTs.length; i++) {
      nftIDArray[i] = unstakedNFTs[i].tokenId;
    }
    await stakingContract.stake(nftIDArray).then((tx) => {
      tx.wait().then(() => {
        setStakeAllLoadingState(false);
        notification.success({
          message: "Success",
          description: "All Staked Successful.😉",
        });
        window.location.reload();
      });
    });
  };
  const approveAllFunc = async () => {
    await usernftContract.setApprovalForAll(config.DEDNFTSTAKINGADDRESS, true).then((tx) => {
      tx.wait().then(() => {
        localStorage.setItem("approve_token", true);
        window.location.reload();
      });
    });
  };

  // UnStakeAll Fuction
  const unStakeAllFunc = async () => {
    setUnStakeAllLoadingState(true);
    const nftIDArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < stakedNFTs.length; i++) {
      nftIDArray[i] = stakedNFTs[i].tokenId;
    }
    await stakingContract.unStake(nftIDArray).then((tx) => {
      tx.wait().then(() => {
        setUnStakeAllLoadingState(false);
        notification.success({
          message: "Success",
          description: "All UnStaked Successful.😉",
        });
        window.location.reload();
      });
    });
  };

  // HarvestAll Fuction
  const harvestAllFunc = async () => {
    setHarvestAllLoadingState(true);
    const nftIDArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < stakedNFTs.length; i++) {
      nftIDArray[i] = stakedNFTs[i].tokenId;
    }
    await stakingContract.claimRewards(nftIDArray).then((tx) => {
      tx.wait().then(() => {
        setHarvestAllLoadingState(false);
        notification.success({
          message: "Success",
          description: "All Harvested Successful.😉",
        });
        window.location.reload();
      });
    });
  };

  useEffect(() => {
    if (account) {
      getStakeData();
    }
  }, [account]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card className="dednftstakingContainer">
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
                <MDTypography variant="h6" color="white" className="doodnftstakingTitle">
                  DedDoods NFT STAKING
                </MDTypography>
              </MDBox>
              <MDBox pt={3} style={{ minHeight: "500px" }}>
                <Grid container spacing={8} p={3}>
                  <Grid
                    item
                    xs={12}
                    xl={6}
                    md={6}
                    mb={3}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <img src={dedCardIMG} className="doodCardIMG" alt="doodCardIMG" />
                  </Grid>
                  <Grid item xs={12} xl={6} md={6} mt={6} className="mintFucContainer">
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
                        <MDTypography variant="h6" color="white" textAlign="center">
                          Upgrading requires your wallet to have double sDood.
                        </MDTypography>
                        <MDTypography variant="h6" color="white" textAlign="center">
                          For example, upgradeMAX require 6300 sDOOD, you must have 12601 in order
                          to upgrade.
                        </MDTypography>
                        <MDTypography variant="h6" color="white" textAlign="center">
                          Note: only required sDOOD will be charged.
                        </MDTypography>
                      </MDBox>
                      {account ? (
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDBox
                            style={{ width: "100%", display: "flex", justifyContent: "center" }}
                          >
                            {loadingState ? (
                              <CircularProgress color="success" />
                            ) : (
                              <MDBox pt={3} ml={3} mr={3} mb={3} className="description2">
                                <MDTypography variant="h6" textAlign="center" mb={1}>
                                  {stakedNFTs.length / 10000}% Staked : {stakedNFTs.length} / 10000
                                </MDTypography>
                                <MDTypography variant="h6" textAlign="center" mb={1}>
                                  My SDOOD Balance : {sdoodAmount}
                                </MDTypography>
                                <MDTypography variant="h6" textAlign="center" mb={1}>
                                  You have staked {stakedNFTs.length} DoodCats and <br />
                                  {unstakedNFTs.length} DoodCats available to stake.
                                </MDTypography>
                                {approveNFTState ? (
                                  <></>
                                ) : (
                                  <>
                                    <MDTypography variant="h6" textAlign="center" mb={1}>
                                      You will need to approve before start staking !
                                    </MDTypography>
                                    <MDButton
                                      color="success"
                                      style={{ width: "100%" }}
                                      onClick={() => approveAllFunc()}
                                    >
                                      <MDTypography variant="h6" textAlign="center" color="white">
                                        {approveNFTState ? (
                                          <CircularProgress
                                            color="inherit"
                                            style={{ width: "20px", height: "20px" }}
                                          />
                                        ) : (
                                          "Approve All"
                                        )}
                                      </MDTypography>
                                    </MDButton>
                                  </>
                                )}
                              </MDBox>
                            )}
                          </MDBox>
                        </MDBox>
                      ) : (
                        <MDBox pt={3} ml={3} mr={3} mb={3}>
                          <MDTypography variant="h5" textAlign="center" mb={1}>
                            - Lvl 0 - Earn 150 per day
                          </MDTypography>
                          <MDTypography variant="h5" textAlign="center" mb={1}>
                            - Lvl 1 costs 900 $sDOOD = Lvl 1 - Earn 200 sDOOD/day
                          </MDTypography>
                          <MDTypography variant="h5" textAlign="center" mb={1}>
                            - Lvl 2 costs 1350 $sDOOD = Lvl 2 - Earn 250 sDOOD/day
                          </MDTypography>
                          <MDTypography variant="h5" textAlign="center" mb={1}>
                            - Lvl 3 costs 1800 $sDOOD = Lvl 3 - Earn 300 sDOOD/day
                          </MDTypography>
                          <MDTypography variant="h5" textAlign="center" mb={1}>
                            - Lvl 4 costs 2250 $sDOOD = Lvl 4 - Earn 400 sDOOD/day
                          </MDTypography>
                        </MDBox>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </MDBox>
              <>
                {account ? (
                  <>
                    {!loadingState ? (
                      <>
                        <MDBox p={3}>
                          <Grid container spacing={6}>
                            <Grid item xs={12}>
                              <Card className="">
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
                                    STAKED NFTs
                                  </MDTypography>
                                </MDBox>
                                <MDBox pt={5} className="nftContainer">
                                  {!stakedState ? (
                                    <div className="errorContainer">
                                      <FrownOutlined
                                        style={{
                                          fontSize: "30px",
                                          color: "#344767",
                                          width: "100%",
                                        }}
                                      />
                                      <h4
                                        style={{
                                          fontWeight: "800",
                                          color: "#344767",
                                        }}
                                      >
                                        NO STAKED NFTs
                                      </h4>
                                    </div>
                                  ) : (
                                    <>
                                      <Grid
                                        container
                                        spacing={4}
                                        justifyContent="center"
                                        alignItems="center"
                                        direction="row"
                                        p={3}
                                      >
                                        <Grid item xs={12} xl={4} md={4}>
                                          <MDBox
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <MDButton
                                              color="success"
                                              style={{ width: "100%" }}
                                              onClick={() => harvestAllFunc()}
                                            >
                                              <MDTypography
                                                variant="h6"
                                                textAlign="center"
                                                color="white"
                                              >
                                                {harvestAllLoadingState ? (
                                                  <CircularProgress
                                                    color="inherit"
                                                    style={{ width: "20px", height: "20px" }}
                                                  />
                                                ) : (
                                                  "HARVEST ALL"
                                                )}
                                              </MDTypography>
                                            </MDButton>
                                          </MDBox>
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          xl={4}
                                          md={4}
                                          style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <MDTypography variant="h5">
                                            Total Balance : {totalBalance}
                                          </MDTypography>
                                        </Grid>
                                        <Grid item xs={12} xl={4} md={4}>
                                          <MDBox
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <MDButton
                                              color="black"
                                              style={{ width: "100%" }}
                                              onClick={() => unStakeAllFunc()}
                                            >
                                              <MDTypography
                                                variant="h6"
                                                textAlign="center"
                                                color="white"
                                              >
                                                {unstakeAllLoadingState ? (
                                                  <CircularProgress
                                                    color="inherit"
                                                    style={{ width: "20px", height: "20px" }}
                                                  />
                                                ) : (
                                                  "UNSTAKE ALL"
                                                )}
                                              </MDTypography>
                                            </MDButton>
                                          </MDBox>
                                        </Grid>
                                      </Grid>
                                      <MDBox className="nftPanel">
                                        <Grid
                                          container
                                          spacing={4}
                                          mt={3}
                                          justifyContent="center"
                                          alignItems="center"
                                          direction="row"
                                          p={3}
                                        >
                                          {stakedNFTs.map((nft, index) => (
                                            <Grid item xs={12} xl={3} md={3} mb={3} key={index}>
                                              <MDBox mb={1.5}>
                                                <NFTCard
                                                  tokenID={nft.tokenId}
                                                  isStaked={nft.isStaked}
                                                  balance={nft.balance}
                                                  src={nft.src}
                                                  level={nft.level}
                                                />
                                              </MDBox>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </MDBox>
                                      <Grid
                                        container
                                        spacing={4}
                                        justifyContent="center"
                                        alignItems="center"
                                        direction="row"
                                        p={3}
                                      >
                                        <Grid item xs={12} xl={4} md={4}>
                                          <MDBox
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <MDButton
                                              color="success"
                                              style={{ width: "100%" }}
                                              onClick={() => harvestAllFunc()}
                                            >
                                              <MDTypography
                                                variant="h6"
                                                textAlign="center"
                                                color="white"
                                              >
                                                {harvestAllLoadingState ? (
                                                  <CircularProgress
                                                    color="inherit"
                                                    style={{ width: "20px", height: "20px" }}
                                                  />
                                                ) : (
                                                  "HARVEST ALL"
                                                )}
                                              </MDTypography>
                                            </MDButton>
                                          </MDBox>
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          xl={4}
                                          md={4}
                                          style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <MDTypography variant="h5">
                                            Total Balance : {totalBalance}
                                          </MDTypography>
                                        </Grid>
                                        <Grid item xs={12} xl={4} md={4}>
                                          <MDBox
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <MDButton
                                              color="black"
                                              style={{ width: "100%" }}
                                              onClick={() => unStakeAllFunc()}
                                            >
                                              <MDTypography
                                                variant="h6"
                                                textAlign="center"
                                                color="white"
                                              >
                                                {unstakeAllLoadingState ? (
                                                  <CircularProgress
                                                    color="inherit"
                                                    style={{ width: "20px", height: "20px" }}
                                                  />
                                                ) : (
                                                  "UNSTAKE ALL"
                                                )}
                                              </MDTypography>
                                            </MDButton>
                                          </MDBox>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                </MDBox>
                              </Card>
                            </Grid>
                          </Grid>
                        </MDBox>
                        <MDBox p={3}>
                          <Grid container spacing={6}>
                            <Grid item xs={12}>
                              <Card className="">
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
                                    UNSTAKED NFTs
                                  </MDTypography>
                                </MDBox>
                                <MDBox pt={3} className="nftContainer">
                                  <MDBox className="nftPanel">
                                    <Grid
                                      container
                                      spacing={4}
                                      justifyContent="center"
                                      alignItems="center"
                                      direction="row"
                                      p={3}
                                      mt={1}
                                    >
                                      {!unstakedState ? (
                                        <div className="errorContainer">
                                          <FrownOutlined
                                            style={{
                                              fontSize: "30px",
                                              color: "#344767",
                                              width: "100%",
                                            }}
                                          />
                                          <h4
                                            style={{
                                              fontWeight: "800",
                                              color: "#344767",
                                            }}
                                          >
                                            NO UNSTAKED NFTs
                                          </h4>
                                        </div>
                                      ) : (
                                        <>
                                          {unstakedNFTs.map((nft, index) => (
                                            <Grid item xs={12} xl={3} md={3} mb={3} key={index}>
                                              <MDBox mb={1.5}>
                                                <NFTCard
                                                  tokenID={nft.tokenId}
                                                  isStaked={nft.isStaked}
                                                  balance={nft.balance}
                                                  src={nft.src}
                                                  level={nft.level}
                                                />
                                              </MDBox>
                                            </Grid>
                                          ))}
                                        </>
                                      )}
                                    </Grid>
                                    <Grid
                                      container
                                      spacing={4}
                                      justifyContent="center"
                                      alignItems="center"
                                      direction="row"
                                      p={3}
                                    >
                                      <Grid item xs={12} xl={4} md={4} />
                                      <Grid item xs={12} xl={4} md={4}>
                                        <MDBox
                                          style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                          }}
                                        >
                                          {unstakedState ? (
                                            <MDButton
                                              color="success"
                                              style={{ width: "100%" }}
                                              onClick={() => stakeAllFunc()}
                                            >
                                              <MDTypography
                                                variant="h6"
                                                textAlign="center"
                                                color="white"
                                              >
                                                {stakeAllLoadingState ? (
                                                  <CircularProgress
                                                    color="inherit"
                                                    style={{ width: "20px", height: "20px" }}
                                                  />
                                                ) : (
                                                  "STAKE ALL"
                                                )}
                                              </MDTypography>
                                            </MDButton>
                                          ) : (
                                            <></>
                                          )}
                                        </MDBox>
                                      </Grid>
                                      <Grid item xs={12} xl={4} md={4} />
                                    </Grid>
                                  </MDBox>
                                </MDBox>
                              </Card>
                            </Grid>
                          </Grid>
                        </MDBox>
                      </>
                    ) : (
                      <> </>
                    )}
                  </>
                ) : (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <></>
                )}
              </>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default DedNftStaking;
