import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Hosta a.i",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    return (
      <html className="h-full" lang="en">
        <body className={`antialiased h-full`}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </AppRouterCacheProvider>
        </body>
      </html>
    );
  }

  return (
    <html className="h-full" lang="en">
      <body className={`antialiased h-full bg-gray-50 dark:bg-gray-900`}>
        <div id="root" className="h-full w-fuull max-w-[1920px]">
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <SessionProvider session={session}>
                  <Header />
                  <div className="w-full h-full px-6">
                    <div className="h-[80px]" />
                    <div className="h-[calc(100%-110px)]">{children}</div>
                  </div>
                </SessionProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  );
}
