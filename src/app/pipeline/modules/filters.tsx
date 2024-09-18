import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import RadioButtonsGroup from "@/components/RadioGroup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { capitalize } from "@mui/material";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const statuses = ["Processing", "Initiated", "Failed", "Processed", "Aborted"];
const priorities = ["0", "1"];
const roomTypes = ["bedroom", "bathroom", "laundry", "living room", "other", "dining room", "kitchen", "garage"];

function GridFilters({ filters, handleFilter, clearFilter }: { filters: any; handleFilter: (name: string, value: string) => void; clearFilter: (name: string) => void }) {
  const [orgs, setOrgs] = React.useState([]);

  React.useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await axios.get("/api/proxy/ops/v1/orgs");
        setOrgs(response.data.map((e: any) => e.organization));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Priortization</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <RadioButtonsGroup value={filters["priority"]} name="priority" label="Select a Priority" values={priorities.map((value) => ({ label: value, value }))} handleChange={(evt) => handleFilter("priority", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("priority")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Status</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <RadioButtonsGroup value={filters["status"]} name="status" label="Select a Status" values={statuses.map((value) => ({ label: value, value }))} handleChange={(evt) => handleFilter("status", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("status")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Company Name</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <RadioButtonsGroup value={filters["org"]} name="org" label="Select a Company Name" values={orgs.map((value: any) => ({ label: value, value }))} handleChange={(evt) => handleFilter("org", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("org")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Room Type</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <RadioButtonsGroup value={filters["roomType"]} name="roomType" label="Select a Room Type" values={roomTypes.map((value) => ({ label: capitalize(value), value }))} handleChange={(evt) => handleFilter("roomType", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("roomType")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Claim Id</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <TextField label="Claim Id" value={filters["claimId"]} onChange={(evt) => handleFilter("claimId", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("claimId")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>Job Id</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col gap-4">
          <TextField label="Job Id" value={filters["jobId"]} onChange={(evt) => handleFilter("jobId", evt.target.value)} />
          <Button variant="outlined" onClick={() => clearFilter("jobId")}>
            Clear Filter
          </Button>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

const FilterDialog = ({ open, handleClose, handleApply, updatedFilters }: { open: boolean; handleClose: () => void; handleApply: (filters: any) => void; updatedFilters: any }) => {
  const [filters, setFilters] = React.useState({
    priority: "",
    status: "",
    org: "",
    roomType: "",
    claimId: "",
    jobId: "",
  });

  React.useEffect(() => {
    setFilters({
      ...filters,
      status: updatedFilters.status || "",
      priority: updatedFilters.priority || "",
      org: updatedFilters.org || "",
      roomType: updatedFilters.roomType || "",
      claimId: updatedFilters.claimId || "",
      jobId: updatedFilters.jobId || "",
    });
  }, [updatedFilters]);

  const clearFilter = (name: string) => {
    const newFilters: any = { ...filters };
    newFilters[name] = "";
    setFilters(newFilters);
  };

  const handleFilter = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{"Add Filter(s)"}</DialogTitle>
      <DialogContent>
        <GridFilters filters={filters} clearFilter={clearFilter} handleFilter={handleFilter} />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => handleApply(filters)}>
          Apply
        </Button>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
