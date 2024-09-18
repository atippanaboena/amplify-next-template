"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useRouter } from "next/navigation";

interface FileWithPreview {
  file: File;
  preview: string;
}

const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function FileUpload() {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const notifications = useNotifications();
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  const handleUpload = async () => {
    const captureId = uuidv4();
    const url = `${process.env.NEXT_PUBLIC_NEURO_API_URL}/capture/${captureId}`;
    const formData = new FormData();

    files.forEach((fileObj, idx) => {
      formData.append("files_" + (idx + 1), fileObj.file);
    });

    formData.append("capture_id", captureId);

    try {
      setLoading(true);
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await axios.post(url + "/start", { capture_id: captureId });
      notifications.show("Images Uploaded Successfully!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      notifications.show("Failed to Upload Images", {
        severity: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        router.push(`/neuro3d/${captureId}`);
      }, 3000);
    }
  };

  return (
    <Box>
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
      <div className="flex w-full h-full items-center justify-center flex-col gap-4">
        <div className="border border-dashed border-1 border-sky-500 p-8 cursor-pointer rounded-lg" {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
        </div>
        {files.length > 0 && (
          <div className="flex flex-row gap-4">
            <Button className="!capitalize" variant="outlined" onClick={handleUpload}>
              Upload Files
            </Button>
            <Button className="!capitalize" variant="outlined" onClick={() => setFiles([])}>
              Clear Files
            </Button>
          </div>
        )}
        <div className="flex flex-row gap-4 flex-wrap items-center justify-center">
          {files.map((file, index) => (
            <div key={index}>
              <img className="w-auto max-h-[75px] rounded-lg" src={file.preview} alt={file.file.name} />
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
}
