import React from "react";
// import { Box, Card } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
const Walletandexpense = ({ st, val, btn }) => {
  return (
    <div>
      <Box sx={{ maxWidth: 355 }}>
        <Card
          variant="outlined"
          sx={{
            padding: "1rem",
            backgroudColor: "#f3f3f3",
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <h2>
            {st} : {val}
          </h2>
          <Button size="large">{btn}</Button>
        </Card>
      </Box>
    </div>
  );
};

export default Walletandexpense;
