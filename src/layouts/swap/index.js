import { useState, useCallback } from "react";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { SwapWidget, AddLiquidityModal } from "@pangolindex/components";

function Swap() {
  const [isAddLiquidityModalOpen, setAddLiquidityModalOpen] = useState(false);
  const handleAddLiquidityModalClose = useCallback(() => {
    setAddLiquidityModalOpen(false);
  }, [setAddLiquidityModalOpen]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={0} xl={3} md={3} />
          <Grid item xs={12} xl={5} md={6}>
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
                  SWAP
                </MDTypography>
              </MDBox>
              <MDBox pt={3} mb={3}>
                <SwapWidget defaultOutputToken="0x697bb3B5E1eCf4fEbE6016321b0648d3d6C270B6" />
              </MDBox>
              <MDButton variant="success" onClick={() => setAddLiquidityModalOpen(true)}>
                Create a pair
              </MDButton>
              <AddLiquidityModal
                isOpen={isAddLiquidityModalOpen}
                onClose={handleAddLiquidityModalClose}
              />
            </Card>
          </Grid>
          <Grid item xs={0} xl={3} md={3} />
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Swap;
