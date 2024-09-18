import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import { TransitionProps } from "@mui/material/transitions";
import GooglePlacesAutocomplete, { geocodeByPlaceId } from "react-google-places-autocomplete";
import { extractAddress } from "@/utils";
import axios from "axios";
import { useNotifications } from "@toolpad/core/useNotifications";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PropertyDialog({ open, handleClose, handleSave }: { open: boolean; handleClose: () => void; handleSave: (claimId: string) => void }) {
  const [claimId, setClaimId] = React.useState("");
  const [houseNum, setHouseNum] = React.useState("");
  const [addressDetails, setAddressDetails] = React.useState<any>(null);
  const notifications = useNotifications();

  const handleSubmit = () => {
    geocodeByPlaceId(addressDetails.value.place_id).then((results) => {
      const extractedAddress = extractAddress(results[0].address_components);
      const data = { claimInfo: { damageType: "", ...extractedAddress, address2: houseNum, notes: "", customerID: claimId }, customerID: claimId };
      axios.post("/api/proxy/portal/v1/claim", data).then((response) => {
        notifications.show("Claim created successfully", { severity: "success", autoHideDuration: 3000 });
        handleSave(response.data.claimId);
      });
    });
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{"Property Details"}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 h-full w-full min-h-[300px]">
          <TextField value={claimId} label="Claim Id" variant="standard" onChange={(evt) => setClaimId(evt.target.value)} />
          <GooglePlacesAutocomplete
            apiKey="AIzaSyCIecASih5FGMWfSrF-1a_HJIlTqagmaPg"
            minLengthAutocomplete={3}
            selectProps={{
              placeholder: "Type your address here",
              value: addressDetails,
              onChange: (value) => {
                setAddressDetails(value);
              },
              styles: {
                input: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                option: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black",
                }),
              },
            }}
          />
          <TextField value={houseNum} label="Apt/Suite (Optional)" variant="standard" onChange={(evt) => setHouseNum(evt.target.value)} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
