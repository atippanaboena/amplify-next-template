import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import { TransitionProps } from "@mui/material/transitions";
import RadioButtonsGroup from "@/components/RadioGroup";
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

const values = [
  { label: "Policy Holder", value: "plolicy_holder" },
  { label: "Contractor", value: "contractor" },
  { label: "Adjuster", value: "adjuster" },
  { label: "None", value: "unknown" },
];

export default function RequestImageDialog({ open, handleClose, claimId }: { open: boolean; handleClose: () => void; claimId: string }) {
  const [userType, setUserType] = React.useState("");
  const [returnLink, setReturnLink] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const notification = useNotifications();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(event.target.value);
  };

  React.useEffect(() => {
    if (userType) {
      axios.post(`/api/proxy/portal/v1/claim/${claimId}/room/request?returnLink=True&userType=${userType}&expirationHours=2160`, {}).then((response) => {
        setReturnLink(response.data.link);
      });
    }
  }, [userType]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(returnLink || "")
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleEmail = () => {
    axios.post(`/api/proxy/portal/v1/claim/${claimId}/room/request?userType=${userType}&expirationHours=2160`, { email }).then((response) => {
      notification.show("Capture Link sent successfully", { severity: "success", autoHideDuration: 3000 });
      setEmail("");
      setReturnLink(null);
      setUserType("");
      handleClose();
    });
  };

  const onClose = () => {
    setEmail("");
    setReturnLink(null);
    setUserType("");
    handleClose();
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{"Request Capture Link"}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 py-4">
          {!userType && !returnLink && <RadioButtonsGroup label="Please select an user Type (If applicable)" values={values} name="user-type" value={userType} handleChange={handleChange} />}
          {userType && !returnLink && <p>Requesting Capture Link...</p>}
          {returnLink && (
            <>
              <TextField
                label="Enter Email Address or Phone Number"
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
                placeholder="Email Address or Phone Number"
                InputProps={{
                  endAdornment: email && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleEmail}>
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="filled"
                fullWidth
              />
              <Typography variant="body2">OR</Typography>
              <TextField
              color="info"
                variant="filled"
                label="Use the following link to capture images"
                value={returnLink}
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopy}>
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
