import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useWeb3React } from "@web3-react/core";
import CircularProgress from "@mui/material/CircularProgress";

import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { notification } from "antd";
import mintIMG from "../../assets/images/mintIMG.png";

import config, { maxSupply } from "../../config/config";

//  ABI
import DEDDOODABI from "../../assets/abi/dednftABI.json";
//  Customize Mint Css
import "./mint.css";

const ethers = require("ethers");

function Mint() {
  const { account } = useWeb3React();

  const [mintCount, setMintCount] = useState(0);
  const [mintCost, setMintCost] = useState(1234);
  const [mintState, setMintState] = useState(true);
  const [nftCount, setNftCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get Contract Data
  const deddoodProvider = new ethers.providers.Web3Provider(window.ethereum);
  const deddoodSigner = deddoodProvider.getSigner();
  const deddoodContract = new ethers.Contract(config.DEDNFTADDRESS, DEDDOODABI, deddoodSigner);
  // Get MintState Data
  const mintStateFunc = async () => {
    let balance = 0;
    if (account) {
      balance = await deddoodContract.totalSupply();
      const count = Number(balance.toString());
      setMintCount(count);
      if (count >= maxSupply) {
        setMintState(false);
      }
    }
  };

  useEffect(() => {
    if (account) {
      mintStateFunc();
    }
  }, [account]);

  // Mint Function
  const mintFunc = async () => {
    if (account) {
      if (mintState) {
        setLoading(true);
        const totalCost = mintCost;
        await deddoodContract
          .mint(nftCount, {
            gasLimit: config.gasLimit,
            value: ethers.utils.parseEther(totalCost.toString()),
          })
          .then((tx) => {
            tx.wait().then(() => {
              notification.success({
                message: "Success",
                description: "Mint Successful.",
              });
              setLoading(true);
              window.location.reload();
            });
          })
          .catch(() => {
            notification.error({
              message: "Error",
              description: "Not Enough SGB",
            });
          });
      }
    }
  };
  // Control Minting Cost SGB
  const controlMintCostFunc = (increaseFlag) => {
    if (increaseFlag) {
      if (mintCost < 6170) {
        setMintCost(mintCost + 1234);
        setNftCount(nftCount + 1);
      }
    } else if (mintCost > 1234) {
      setMintCost(mintCost - 1234);
      setNftCount(nftCount - 1);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={5}>
          <Grid item xs={12}>
            <Card className="mintContainer">
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
                  MINT
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
                    <img src={mintIMG} className="mintIMG" alt="mintIMG" />
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
                        <MDTypography variant="h5" color="white" textAlign="center">
                          DedDoods NFTs available to mint with sDood who dieded due of Excessive
                          Curiosity
                        </MDTypography>
                      </MDBox>
                      <MDBox pt={3} ml={3} mr={3} mb={3}>
                        {mintState ? (
                          <>
                            <MDTypography variant="h4" textAlign="center" mb={1}>
                              Minted {mintCount} / {maxSupply}
                            </MDTypography>
                            <MDTypography variant="h4" textAlign="center" mb={1}>
                              DOOD! Get your DedDooD
                            </MDTypography>
                            <MDTypography variant="h4" textAlign="center" mb={1}>
                              Minting Cost : {mintCost} SGB
                            </MDTypography>
                            {account ? (
                              <MDBox
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "center",
                                  paddingLeft: "20%",
                                  paddingRight: "20%",
                                }}
                              >
                                <MDButton
                                  color="success"
                                  className="minusBTN"
                                  onClick={() => controlMintCostFunc(false)}
                                  style={{ marginRight: "10%" }}
                                >
                                  -
                                </MDButton>
                                {loading ? (
                                  <CircularProgress
                                    color="inherit"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                ) : (
                                  <MDButton color="success" className="mintBTN" onClick={mintFunc}>
                                    Mint
                                  </MDButton>
                                )}
                                <MDButton
                                  color="success"
                                  className="minusBTN"
                                  onClick={() => controlMintCostFunc(true)}
                                  style={{ marginLeft: "10%" }}
                                >
                                  +
                                </MDButton>
                              </MDBox>
                            ) : (
                              <MDBox
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "center",
                                  paddingLeft: "20%",
                                  paddingRight: "20%",
                                }}
                              >
                                <MDButton
                                  color="success"
                                  className="minusBTN"
                                  style={{ marginRight: "10%" }}
                                  disabled
                                >
                                  -
                                </MDButton>
                                <MDButton color="success" className="mintBTN" disabled>
                                  Mint
                                </MDButton>
                                <MDButton
                                  color="success"
                                  className="minusBTN"
                                  style={{ marginLeft: "10%" }}
                                  disabled
                                >
                                  +
                                </MDButton>
                              </MDBox>
                            )}
                          </>
                        ) : (
                          <MDTypography variant="h4" textAlign="center" mb={1}>
                            Mint was completed! 🤷‍♂️
                          </MDTypography>
                        )}
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

export default Mint;
