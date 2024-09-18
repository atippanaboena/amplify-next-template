"use client";
import FileUpload from "./modules/fileupload";
import { NotificationsProvider } from "@toolpad/core/useNotifications";

export default function Neuro3d() {
  return (
    <NotificationsProvider>
      <FileUpload />
    </NotificationsProvider>
  );
}
