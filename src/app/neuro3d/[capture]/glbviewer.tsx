import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/Fullscreen";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface GLBViewerProps {
  url: string;
  scale?: number;
  rotate?: boolean;
  initialTilt?: {
    x: number;
    y: number;
    z: number;
  };
}

const GLBViewer: React.FC<GLBViewerProps> = ({ url, scale = 0.5, rotate = false, initialTilt = { x: 0.5, y: -0.5, z: 0.2 } }) => {
  const { scene } = useGLTF(atob(url), true);

  useEffect(() => {
    // Set the initial tilt
    scene.rotation.set(initialTilt.x, initialTilt.y, initialTilt.z);

    if (rotate) {
      const rotateModel = () => {
        scene.rotation.y += 0.01; // Rotating around the y-axis
        requestAnimationFrame(rotateModel);
      };
      rotateModel();
    }
  }, [rotate, scene, initialTilt]);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "white", boxSizing: "content-box" }}>
      <Canvas camera={{ fov: 10 }} gl={{ alpha: false }}>
        <color attach="background" args={["white"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Environment preset="sunset" />
        <primitive scale={scale} object={scene} />
        <OrbitControls enablePan={false} maxDistance={5} minDistance={2} zoomSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default function Glb3dViewer({ url, title, scale = 0.3 }: { url: string; title: string; scale: number }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <Typography>{title}</Typography>
        <div className="flex gap-4">
          <IconButton edge="start" color="inherit" onClick={handleClickOpen} aria-label="expand">
            <ExpandMoreIcon />
          </IconButton>
          <IconButton href={atob(url)} edge="start" color="inherit" onClick={() => {}} aria-label="download">
            <CloudDownloadIcon />
          </IconButton>
        </div>
      </div>
      <div className="h-full">{!open && <GLBViewer url={url} scale={scale} />}</div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">{title}</Typography>
          </Toolbar>
        </AppBar>
        <div style={{ width: "100%", height: "100%" }}>{open && <GLBViewer url={url} scale={scale} />}</div>
      </Dialog>
    </div>
  );
}
