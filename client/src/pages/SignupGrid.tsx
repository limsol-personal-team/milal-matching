import * as React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import {
  randomCreatedDate,
  randomTraderName,
  randomUpdatedDate,
} from "@mui/x-data-grid-generator";
import MilalFriendTable from "../components/MilalFriendTable";
import VolunteerTable from "../components/VolunteerTable";

export default function SignupGrid() {
  return (
    <>
      <div style={{ display: "flex", padding: "0 0 0 0" }}>
        <MilalFriendTable />
      </div>
      <div style={{ display: "flex", padding: "75px 0 0 0" }}>
        <VolunteerTable />
      </div>
    </>
  );
}
