"use client";
import React, { useCallback, useEffect, useState } from "react";
import { BodyScrollEndEvent, ColDef, GridReadyEvent, IDatasource, ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.min.css";
import "@ag-grid-community/styles/ag-theme-alpine.min.css";
import axios from "axios";
import Slider from "@mui/material/Slider";
import GridFilters from "./filters";
import Button from "@mui/material/Button";
import TuneIcon from "@mui/icons-material/Tune";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CountButton = ({ data, column }: CustomCellRendererProps) => {
  if (column?.getColId()) return <Chip size="medium" sx={{ fontSize: "large" }} label={data?.roomsSummary[column.getColId()]} />;
  return "-";
};

const columns: ColDef[] = [
  { headerName: "Organization", field: "organization", pinned: "left" },
  { headerName: "Claim Id", field: "claimId", pinned: "left", minWidth: 320 },
  { headerName: "Customer ID", field: "customerID" },
  { headerName: "Submitter", field: "submitter" },
  { headerName: "Address", field: "address" },
  { headerName: "Date Submitted", field: "dateSubmitted" },
  { headerName: "Time Submitted", field: "timeSubmitted" },
  { headerName: "Inferred Claim Status", field: "inferredClaimStatus" },
  { headerName: "Initiated", field: "Initiated", cellRenderer: CountButton },
  { headerName: "Processed", field: "Processed", cellRenderer: CountButton },
  { headerName: "Processing", field: "Processing", cellRenderer: CountButton },
  { headerName: "Not Processable", field: "Not Processable", cellRenderer: CountButton },
];

const Grid = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [evaluated, setEvaluated] = useState(null);
  const [maxDays, setMaxDays] = useState<number | number[] | undefined>(7);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [claimId, setClaimId] = useState("");

  const gridCols = columns.map((col) => {
    col.valueFormatter = col.headerName?.includes("Time")
      ? (params) => {
          if (!params.value) return "-";
          return new Date(params.value).toLocaleString();
        }
      : undefined;
    return { ...col, rowDrag: false, cellClass: "flex items-center" };
  });

  const fetchRows = async (type: "scroll" | "initial") => {
    try {
      let url = `/api/proxy/ops/v1/claims?maxDays=${maxDays}`;
      if (Boolean(evaluated) && evaluated !== "null" && evaluated !== "undefined") {
        url += `&LastEvaluatedKey=${evaluated}`;
      }
      if (claimId) url += `&claimId=${claimId}`;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url += `&${key}=${value}`;
      });
      setLoading(true);
      const response = await axios.get(url);
      setLoading(false);
      const rows = response.data.claims;
      setEvaluated(response.data.LastEvaluatedKey);
      if (type === "initial") {
        setRowData(rows);
        return;
      }
      setRowData(rowData.length ? [...rowData, ...rows] : rows);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setRowData([]);
    fetchRows("initial");
  }, [maxDays, filters, claimId]);

  const onBodyScrollEnd = async (params: BodyScrollEndEvent) => {
    if (params.api.getLastDisplayedRowIndex() === rowData.length - 1) {
      if (Boolean(evaluated) && evaluated !== "null" && evaluated !== "undefined") await fetchRows("scroll");
    }
  };

  const handleFilters = (data: any) => {
    setFilters(data);
    setOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex w-full items-center gap-5">
        <div className="min-w-[300px]">
          <TextField
            placeholder="Search with Claim ID"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            InputProps={{
              endAdornment: claimId && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setClaimId("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </div>
        <div className="flex flex-1 w-full items-center gap-5 py-4">
          <div className="flex flex-col min-w-[300px]">
            Max Days: {maxDays}
            <Slider value={maxDays} max={365} min={1} marks step={1} valueLabelDisplay="auto" onChange={(evt:any, val:any) => setMaxDays(val)} />
          </div>
          <div>
            <Button startIcon={<TuneIcon />} variant="contained" onClick={() => setOpen(true)}>
              Filters
            </Button>
            <GridFilters updatedFilters={filters} open={open} handleClose={() => setOpen(false)} handleApply={handleFilters} />
          </div>
        </div>
      </div>
      {Object.values(filters).filter((e) => e !== "").length > 0 && (
        <div className="flex gap-4 py-4">
          <Button variant="outlined" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
          {Object.entries(filters)
            .filter(([_, value]) => value !== "")
            .map(([key, value]) => {
              return <Chip key={key} label={`${key}: ${value}`} onDelete={() => setFilters((prev: any) => ({ ...prev, [key]: "" }))} />;
            })}
        </div>
      )}
      <div className="h-full w-full ag-theme-alpine-auto-dark">
        <AgGridReact loading={loading} columnDefs={gridCols} rowData={rowData} onBodyScrollEnd={onBodyScrollEnd} />
      </div>
    </div>
  );
};

export default Grid;
