"use client";
import React, { use, useCallback, useEffect, useState } from "react";
import { BodyScrollEndEvent, ColDef, GridReadyEvent, IDatasource, ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.min.css";
import "@ag-grid-community/styles/ag-theme-alpine.min.css";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PropertyDialog from "./property";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/AddAPhoto";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import RequestImageDialog from "./request";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Grid = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showOrg, setShowOrg] = useState(false);
  const [startDate, setStartDate] = useState<moment.Moment | null>(moment());
  const [endDate, setEndDate] = useState<moment.Moment | null>(moment());
  const [requestImage, setRequestImage] = useState(false);
  const [claimId, setClaimId] = useState("");

  useEffect(() => {
    handleSearch();
  }, [page, open]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = () => {
    const start = (page - 1) * 10;
    const end = page * 10;
    setLoading(true);
    const params: any = { start, end, search, searchByOrg: showOrg, startTimestamp: showOrg ? (startDate?.get("milliseconds") || 0) / 1000 : 0, endTimestamp: showOrg ? (endDate?.get("milliseconds") || 0) / 1000 : 0 };
    let url = "/api/proxy/portal/v1/claim";
    let first = true;
    Object.keys(params).forEach((key, index) => {
      if (params[key]) {
        url += (first ? "?" : "&") + key + "=" + params[key];
        first = false;
      }
    });
    axios.get(url).then((response) => {
      setRowData(response.data.claims);
      setTotal(response.data.totalCount);
      setLoading(false);
    });
  };

  const startSearch = () => {
    setPage(1);
    handleSearch();
  };

  const clearSearch = () => {
    setSearch("");
    setStartDate(moment());
    setEndDate(moment());
    setShowOrg(false);
    handleSearch();
  };

  const closeRequestImage = () => {
    setRequestImage(false);
    setClaimId("");
  };

  const ActionsRenderer = (props: CustomCellRendererProps) => {
    const handleEdit = useCallback(() => {
      alert("Edit clicked");
    }, []);

    const handleDelete = useCallback(() => {
      alert("Delete clicked");
    }, []);

    const handleRequestImage = () => {
      setRequestImage(true);
      setClaimId(props.data.claimId);
    };

    return (
      <div className="flex gap-2">
        <IconButton title="Edit Claim" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
        <IconButton title="Delete Claim" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
        <IconButton title="Request Image" onClick={handleRequestImage}>
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  const columns: ColDef[] = [
    { field: "actions", headerName: "Actions", cellRenderer: ActionsRenderer, pinned: "left" },
    { field: "claimId", headerName: "Claim ID", pinned: "left", minWidth: 320 },
    { field: "customerID", headerName: "Customer ID", flex: 1 },
    { field: "address", headerName: "Address", flex: 1},
    { field: "timeInitiated", headerName: "Date Initiated", flex: 0.5, valueFormatter: (params) => new Date(params.value * 1000).toLocaleDateString() },
  ];

  const handleSave = (claimId: string) => {
    setOpen(false);
    setClaimId(claimId);
    setRequestImage(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <NotificationsProvider>
        <div className="flex flex-col h-full w-full gap-4">
          <PropertyDialog open={open} handleClose={() => setOpen(false)} handleSave={handleSave} />
          <RequestImageDialog open={requestImage} handleClose={closeRequestImage} claimId={claimId} />
          <div className="flex py-4 gap-4">
            <Button variant="outlined" size="small" color="primary" onClick={() => setOpen(true)}>
              Add Claim
            </Button>
            <div className="flex items-center gap-4">
              <TextField
                value={search}
                onChange={(evt) => setSearch(evt.target.value)}
                size="small"
                label="Search Here"
                variant="outlined"
                InputProps={{
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton onClick={startSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormGroup>
                <FormControlLabel control={<Switch checked={showOrg} onChange={() => setShowOrg(!showOrg)} />} label="Show Results from Organization" />
              </FormGroup>
              {showOrg && <DatePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />}
              {showOrg && <DatePicker label="End Date" value={endDate} onChange={(newValue) => setEndDate(newValue)} />}
              {showOrg && (
                <Button disabled={!moment(startDate).isValid() || !moment(endDate).isValid()} onClick={startSearch} variant="outlined" size="small" color="primary">
                  Search
                </Button>
              )}
              {(showOrg || search) && (
                <Button onClick={clearSearch} variant="outlined" size="small">
                  Clear Search
                </Button>
              )}
            </div>
          </div>
          <div className="h-full w-full ag-theme-alpine-auto-dark">
            <AgGridReact loading={loading} columnDefs={columns} rowData={rowData} />
          </div>
          <Pagination page={page} onChange={handleChange} count={Math.ceil(total / 10)} />
        </div>
      </NotificationsProvider>
    </LocalizationProvider>
  );
};

export default Grid;
