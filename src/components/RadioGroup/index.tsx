import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function RadioButtonsGroup({ value = "", name, handleChange, values, label }: { name: string; label: string; value?: string; handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void; values: { label: string; value: string }[] }) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <RadioGroup name={name} value={value || ""} onChange={handleChange}>
        {values.map((item) => (
          <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
