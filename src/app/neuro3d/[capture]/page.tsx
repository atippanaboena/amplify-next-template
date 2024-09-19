"use client";
import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Glb3dViewer from "./glbviewer";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import LinearProgress from "@mui/material/LinearProgress";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "./styles.css";

// import required modules
import { Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div className="h-full" role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (
        <Box className="h-full" p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Page({ params }: { params: { capture: string } }) {
  const [value, setValue] = React.useState(0);
  const [data, setData] = useState<any>({});
  const swiperRef = React.useRef<SwiperRef>(null);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [polling, setPolling] = useState(true);
  const [jobStatus, setJobStatus] = useState<"JOB_COMPLETED" | "JOB_INITIATED" | "MODEL_INFERENCE_INITIATED" | "SPATIAL_REASONING_INITIATED">("JOB_INITIATED");

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_NEURO_API_URL}/capture/${params.capture}/results`).then((response) => {
      setData(response.data);
      setPolling(true);
    });
  }, []);

  useEffect(() => {
    swiperRef.current?.swiper?.slideTo(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (polling) {
      const interval = setInterval(() => {
        axios
          .get(data?.["2d_floorplan_url"])
          .then((response) => {
            setPolling(false);
            clearInterval(interval);
          })
          .catch((error) => {
            console.log(error);
          });
        axios.get(`${process.env.NEXT_PUBLIC_NEURO_API_URL}/capture/${params.capture}/executions`).then((response) => {
          const executionId = response.data?.executions?.[0]?.execution_id;
          if (executionId) {
            axios.get(`${process.env.NEXT_PUBLIC_NEURO_API_URL}/capture/${params.capture}/status/${executionId}`).then((results) => {
              const status = results.data?.current_state;
              // if (status === "JOB_COMPLETED") {
              //   setPolling(false);
              //   clearInterval(interval);
              // }
              if (["JOB_COMPLETED", "MODEL_INFERENCE_INITIATED", "SPATIAL_REASONING_INITIATED"].includes(status)) {
                setJobStatus(status);
              } else {
                setJobStatus("JOB_INITIATED");
              }
            });
          }
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [polling, data]);

  const getActiveStep = (status: string) => {
    switch (status) {
      case "JOB_INITIATED":
        return 1;
      case "MODEL_INFERENCE_INITIATED":
        return 2;
      case "SPATIAL_REASONING_INITIATED":
        return 3;
      case "JOB_COMPLETED":
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 rounded-lg">
      <div>
        <Button onClick={() => router.push("/neuro3d")} startIcon={<ArrowBack />} variant="outlined">
          Back
        </Button>
      </div>
      {polling && (
        <>
          <div className="h-10">
            <LinearProgress variant="buffer" value={(getActiveStep(jobStatus) - 1) * 25} valueBuffer={getActiveStep(jobStatus) * 25 - 5} />
          </div>
          <Stepper activeStep={getActiveStep(jobStatus)}>
            <Step>
              <StepLabel>Job Initiated</StepLabel>
            </Step>
            <Step>
              <StepLabel>Model Inference Initiated</StepLabel>
            </Step>
            <Step>
              <StepLabel>Spatial Reasoning Initiated</StepLabel>
            </Step>
            <Step>
              <StepLabel>Upload Results</StepLabel>
            </Step>
            <Step>
              <StepLabel>Job Completed</StepLabel>
            </Step>
          </Stepper>
        </>
      )}
      <div className="flex w-full gap-4">
        <div className="flex flex-col w-1/2">
          {data?.images?.length < 1 && <h6>No Images Found for this Room</h6>}
          <Swiper ref={swiperRef} defaultValue={activeIndex} pagination={true} modules={[Pagination]}>
            {data?.images?.map((image: any, index: number) => (
              <SwiperSlide key={index}>
                <img data-testid={`image-${index}`} className="d-block w-100 h-auto" src={image?.url} alt={`Slide ${index}`} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div style={{ display: "flex", gap: 10 }} className="m-3 flex flex-row flex-wrap">
            {data?.images?.map((image: any, index: number) => (
              <img data-testid={`image-thumbnail-${index}`} onClick={() => setActiveIndex(index)} src={image?.url} key={index} style={{ width: "100px", height: "auto", marginBottom: "10px", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div className="h-full w-1/2">
          {!polling && (
            <>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
                <Tab label="Floor Plan 2D" {...a11yProps(0)} />
                <Tab label="Floor Plan 3D" {...a11yProps(1)} />
                <Tab label="Model" {...a11yProps(2)} />
                <Tab label="Output" {...a11yProps(3)} />
              </Tabs>

              <div className="h-[calc(100%-100px)] w-full">
                <TabPanel value={value} index={0}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton edge="start" color="inherit" href={data?.["2d_floorplan_url"]} aria-label="download">
                      <CloudDownloadIcon />
                    </IconButton>
                  </div>
                  <img data-testid="2d_floorplan_url" alt="No Floor Plan" width="auto" height="auto" style={{ maxHeight: 500, cursor: "pointer" }} src={data?.["2d_floorplan_url"]} />
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <div data-testid="3d_floorplan_url" className="h-full">
                    <Glb3dViewer title="Floor Plan 3D" scale={0.03} url={btoa(data?.["3d_floorplan_url"])} />
                  </div>
                </TabPanel>
                <TabPanel value={value} index={2}>
                  <div data-testid="pointcloud_url" className="h-full">
                    <Glb3dViewer scale={0.5} title={"Model"} url={btoa(data?.["pointcloud_url"])} />
                  </div>
                </TabPanel>
                <TabPanel value={value} index={3}>
                  <div data-testid="segmented_pointcloud_url" className="h-full">
                    <Glb3dViewer scale={0.5} title={"Output"} url={btoa(data?.["segmented_pointcloud_url"])} />
                  </div>
                </TabPanel>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
