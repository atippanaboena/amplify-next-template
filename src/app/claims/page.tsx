import Typography from "@mui/material/Typography";
import Grid from "./modules/grid";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Typography variant="h5">Claims Summary</Typography>
      <Grid />
    </div>
  );
}
