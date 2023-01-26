import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { notification } from "antd";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
// import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";

// Customize Information CSS
import "./information.css";

// Contract ABI
import DOODDNFTABI from "../../assets/abi/doodnftABI.json";
import DEDNFTABI from "../../assets/abi/dednftABI.json";
import SDOODABI from "../../assets/abi/sdoodABI.json";
import DEDNFTSTAKINGABI from "../../assets/abi/dednftStakingABI.json";
import DOODDNFTSTAKINGABI from "../../assets/abi/doodnftStakingABI.json";
import SDOODSTAKINGABI from "../../assets/abi/sdoodstakingABI.json";

import config, { DEDNFTSTAKINGADDRESS, DOODNFTSTAKINGADDRESS } from "../../config/config";

const ethers = require("ethers");

function Information() {
  const { account } = useWeb3React();
  const infoProvider = new ethers.providers.Web3Provider(window.ethereum);
  const infoSigner = infoProvider.getSigner();
  const sdoodContract = new ethers.Contract(config.SDOODADDRESS, SDOODABI, infoSigner);
  const doodNFTContract = new ethers.Contract(config.DOODNFTADDRESS, DOODDNFTABI, infoSigner);
  const dedNFTContract = new ethers.Contract(config.DEDNFTADDRESS, DEDNFTABI, infoSigner);
  const doodStakingContract = new ethers.Contract(
    config.DOODNFTSTAKINGADDRESS,
    DOODDNFTSTAKINGABI,
    infoSigner
  );
  const dedStakingContract = new ethers.Contract(
    config.DEDNFTSTAKINGADDRESS,
    DEDNFTSTAKINGABI,
    infoSigner
  );
  const sdoodStakingContract = new ethers.Contract(
    config.SDOODSTAKINGADDRESS,
    SDOODSTAKINGABI,
    infoSigner
  );
  const [sdoodAmount, setSDooDAmount] = useState(0);
  const [sdoodStakedAmount, setSDooDStakedAmount] = useState(0);
  const [mystakeddoodNFTs, setMyStakedDooDNFTs] = useState(0);
  const [mystakeddedNFTs, setMyStakedDeDNFTs] = useState(0);
  const [totalSDOODBurn, setTotalSDOODBurn] = useState(0);
  const [doodTotalReward, setDoodTotalReward] = useState(0);
  const [dedTotalReward, setDedTotalReward] = useState(0);
  const [totalStakedDooDNFTs, setTotalStakedDooDNFTs] = useState(0);
  const [totalStakedDeDNFTs, setTotalStakedDeDNFTs] = useState(0);
  const [doodStakedNftArray, setDoodStakedNftArray] = useState([]);
  const [dedStakedNftArray, setDedStakedNftArray] = useState([]);

  const [doodNftHarvestAllState, setDoodNftHarvestAllState] = useState(false);
  const [dedNftHarvestAllState, setDedNftHarvestAllState] = useState(false);

  // Get Information Data
  const getInfoData = async () => {
    await doodStakingContract.getTotalrewards(account).then((balance) => {
      const unrounded = ethers.utils.formatEther(balance.toString());
      const amount = parseFloat(unrounded).toFixed(2);
      setDoodTotalReward(amount);
    });

    await dedStakingContract.getTotalrewards(account).then((balance) => {
      const unrounded = ethers.utils.formatEther(balance.toString());
      const amount = parseFloat(unrounded).toFixed(2);
      setDedTotalReward(amount);
    });

    // MY Staked NFTs
    await doodStakingContract.getStakedNFTList(account).then(async (data) => {
      const stakedNFTArray = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line no-await-in-loop, no-loop-func
        await doodStakingContract.stakedNFTs(Number(data[i].toString())).then(() => {
          stakedNFTArray.push({
            tokenId: Number(data[i]).toString(),
          });
        });
      }
      setDoodStakedNftArray(stakedNFTArray);
      setMyStakedDooDNFTs(stakedNFTArray.length);
    });

    await dedStakingContract.getStakedNFTList(account).then(async (data) => {
      const stakedNFTArray = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line no-await-in-loop, no-loop-func
        await dedStakingContract.stakedNFTs(Number(data[i].toString())).then(() => {
          stakedNFTArray.push({
            tokenId: Number(data[i]).toString(),
          });
        });
      }
      setDedStakedNftArray(stakedNFTArray);
      setMyStakedDeDNFTs(data.length);
    });
    // Balance of SDOOD
    await sdoodContract.balanceOf(account).then((balance) => {
      const unrounded = ethers.utils.formatEther(balance.toString());
      const amountSDOOD = parseFloat(unrounded).toFixed(2);
      setSDooDAmount(amountSDOOD);
    });

    // Balance of My Skated SDOOD
    await sdoodStakingContract.stakingInfos(account).then((stakeInfo) => {
      const stakedAmount = Number(stakeInfo.amount.toString()) / 10 ** 18;
      setSDooDStakedAmount(stakedAmount);
    });

    // Total SDOOD Burn
    // eslint-disable-next-line no-unused-vars
    let totalDOODNFTSDOODBurn = 0;
    // eslint-disable-next-line no-unused-vars
    let totalDEDNFTSDOODBurn = 0;
    await doodStakingContract.getTotalBurn().then((totalBurn) => {
      const unrounded = ethers.utils.formatEther(totalBurn.toString());
      totalDOODNFTSDOODBurn = parseFloat(unrounded).toFixed(2);
    });
    await dedStakingContract.getTotalBurn().then((totalBurn) => {
      const unrounded = ethers.utils.formatEther(totalBurn.toString());
      totalDEDNFTSDOODBurn = parseFloat(unrounded).toFixed(2);
    });
    setTotalSDOODBurn(parseFloat(totalDOODNFTSDOODBurn + totalDEDNFTSDOODBurn).toFixed(0));

    // Total Skaked DOODCATNFTs
    await doodNFTContract.walletOfOwner(DOODNFTSTAKINGADDRESS).then((nftTotalStaked) => {
      setTotalStakedDooDNFTs(nftTotalStaked.length);
    });

    // Total Skaked DEDCATNFTs
    await dedNFTContract.walletOfOwner(DEDNFTSTAKINGADDRESS).then((nftTotalStaked) => {
      setTotalStakedDeDNFTs(nftTotalStaked.length);
    });
  };

  useEffect(() => {
    if (account) {
      getInfoData();
    }
  }, [account]);

  const doodNftHarvestAll = async () => {
    if (doodStakedNftArray.length === 0) {
      notification.error({
        message: "error",
        description: "No Staked Nfts to harvest!",
      });
    } else {
      setDoodNftHarvestAllState(true);
      const nftIDArray = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < doodStakedNftArray.length; i++) {
        nftIDArray[i] = doodStakedNftArray[i].tokenId;
      }
      await doodStakingContract.claimRewards(nftIDArray).then((tx) => {
        tx.wait().then(() => {
          setDoodNftHarvestAllState(false);
          notification.success({
            message: "Success",
            description: "All Harvested Successful.😉",
          });
          window.location.reload();
        });
      });
    }
  };

  const dedNftHarvestAll = async () => {
    if (dedStakedNftArray.length === 0) {
      notification.error({
        message: "error",
        description: "No Staked Nfts to harvest!",
      });
    } else {
      setDedNftHarvestAllState(true);
      const nftIDArray = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < dedStakedNftArray.length; i++) {
        nftIDArray[i] = dedStakedNftArray[i].tokenId;
      }
      await dedStakingContract.claimRewards(nftIDArray).then((tx) => {
        tx.wait().then(() => {
          setDedNftHarvestAllState(false);
          notification.success({
            message: "Success",
            description: "All Harvested Successful.😉",
          });
          window.location.reload();
        });
      });
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card className="informationContainer">
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
                  INFORMATION
                </MDTypography>
              </MDBox>
              <MDBox
                style={{ display: "flex", width: "100%", justifyContent: "center", padding: "1%" }}
              >
                <MDButton
                  color="success"
                  style={{ marginRight: "1%" }}
                  onClick={() => {
                    doodNftHarvestAll();
                  }}
                >
                  {doodNftHarvestAllState ? (
                    <>
                      HarvestAll (DoodCats)
                      <CircularProgress
                        color="inherit"
                        style={{ width: "20px", height: "20px", marginLeft: "10px" }}
                      />
                    </>
                  ) : (
                    <MDBox>
                      <MDTypography variant="h6" color="white">
                        HarvestAll (Doodcats) : {doodTotalReward}
                      </MDTypography>
                    </MDBox>
                  )}
                </MDButton>
                <MDButton
                  color="success"
                  onClick={() => {
                    dedNftHarvestAll();
                  }}
                >
                  {dedNftHarvestAllState ? (
                    <>
                      HarvestAll (DedDoods)
                      <CircularProgress
                        color="inherit"
                        style={{ width: "20px", height: "20px", marginLeft: "10px" }}
                      />
                    </>
                  ) : (
                    <MDTypography variant="h6" color="white">
                      HarvestAll (DedDoods) : {dedTotalReward}
                    </MDTypography>
                  )}
                </MDButton>
              </MDBox>
              <MDBox pt={3} pl={3} pr={3}>
                <Grid container spacing={4} mt={3} mb={3}>
                  <Grid item xs={12} xl={4} md={4} mb={3}>
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
                          MY sDOOD SUPPLY
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">{sdoodAmount} sDOOD</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} xl={4} md={4}>
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
                          MY sDOOD STAKED
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">{sdoodStakedAmount} sDOOD</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} xl={4} md={4}>
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
                          MY STAKED NFTs
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">
                          DoodCats : {mystakeddoodNFTs} / DedDoods : {mystakeddedNFTs}
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} xl={4} md={4} mb={3}>
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
                          TOTAL sDOOD BURN
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">{totalSDOODBurn} sDOOD</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} xl={4} md={4}>
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
                          TOTAL DoodCats STAKED
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">{totalStakedDooDNFTs} NFTs</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} xl={4} md={4}>
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
                          TOTAL DedDoods STAKED
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        <MDTypography variant="h5">{totalStakedDeDNFTs} NFTs</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Information;
