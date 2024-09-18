"use client";
import React, { useCallback, useEffect, useState } from "react";
import { BodyScrollEndEvent, ColDef, GridReadyEvent, IDatasource, ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import Slider from "@mui/material/Slider";
import GridFilters from "./filters";
import Button from "@mui/material/Button";
import TuneIcon from "@mui/icons-material/Tune";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadingIcon from "@mui/icons-material/Downloading";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const ActionButtons = ({ data }: CustomCellRendererProps) => {
  const handleDownload = (update: boolean) => {
    axios.get(`/api/proxy/ops/v1/room?room_id=${data.roomId}&force_update=${update}`).then((response) => {
      window.open(response.data.url, "_blank");
    });
  };

  return (
    <div className="flex gap-2">
      <IconButton title="Download Room" onClick={() => handleDownload(false)}>
        <DownloadIcon />
      </IconButton>
      <IconButton title="Regenerate and Download Room" onClick={() => handleDownload(true)}>
        <DownloadingIcon />
      </IconButton>
    </div>
  );
};

const columns: ColDef[] = [
  { field: "actions", headerName: "Actions", cellRenderer: ActionButtons, pinned: "left", width: 120 },
  { field: "priority", headerName: "Priority" },
  { field: "roomId", headerName: "Room ID", minWidth: 320, pinned: "left" },
  { field: "claimId", headerName: "Claim ID", minWidth: 320 },
  { field: "status", headerName: "Status" },
  { field: "stage", headerName: "Stage" },
  { field: "org", headerName: "Company" },
  { field: "email", headerName: "Email" },
  { field: "roomType", headerName: "Room Type" },
  { field: "numberOfImages", headerName: "# of Images" },
  { field: "timeSubmitted", headerName: "Time submitted", valueFormatter: (params) => new Date(params.value).toLocaleString() },
  { field: "timeLabelInit", headerName: "Time labelled" },
  { field: "timeModelled", headerName: "Time modelled" },
  { field: "timeQAd", headerName: "Time QAd" },
  { field: "timeProcessed", headerName: "Time processed" },
  { field: "timeLabelled", headerName: "Time to label" },
  { field: "timeModelInit", headerName: "Time to model" },
  { field: "durationQA", headerName: "Time to QA" },
  { field: "totalTime", headerName: "Total time" },
  { field: "notes", headerName: "Comments" },
  { field: "address", headerName: "Address" },
];

const Grid = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [evaluated, setEvaluated] = useState(null);
  const [maxDays, setMaxDays] = useState<number | number[] | undefined>(7);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");

  const gridCols = columns.map((col) => {
    col.valueFormatter = col.headerName?.includes("Time")
      ? (params) => {
          if (!params.value) return "-";
          return new Date(params.value).toLocaleString();
        }
      : undefined;
    return { ...col, autoHeight: true, wrapText: true, rowDrag: false, filter: true, cellClass: "flex items-center" };
  });

  const fetchRows = async (type: "scroll" | "initial") => {
    try {
      let url = `/api/proxy/ops/v1/jobs?minResults=100&maxDays=${maxDays}`;
      if (Boolean(evaluated) && evaluated !== "null" && evaluated !== "undefined") {
        url += `&LastEvaluatedKey=${evaluated}`;
      }
      if (roomId) url += `&roomId=${roomId}`;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url += `&${key}=${value}`;
      });
      setLoading(true);
      const response = await axios.get(url);
      setLoading(false);
      const rows = response.data.jobs;
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
  }, [maxDays, filters, roomId]);

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
            placeholder="Search with Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            InputProps={{
              endAdornment: roomId && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setRoomId("")} edge="end">
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
            <Slider value={maxDays} max={365} min={1} marks step={1} valueLabelDisplay="auto" onChange={(evt: any, val: any) => setMaxDays(val)} />
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
      <div className="h-full w-full ag-theme-quartz-auto-dark">
        <AgGridReact loading={loading} columnDefs={gridCols} rowData={rowData} onBodyScrollEnd={onBodyScrollEnd} />
      </div>
    </div>
  );
};

export default Grid;
