import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from 'next-auth/react'
import ReactQuery from '../../src/providers/ReactQuery';
import { SocketProvider } from "~/providers/SocketProvider";

export const metadata: Metadata = {
  title: "Lone Star Cup Stream Overlay",
  description: "Lone Star Cup Stream Overlay",
  //icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <ReactQuery>
        <SocketProvider>
          <html lang="en" className={`${GeistSans.variable}`}>
            <body>{children}</body>
          </html>
        </SocketProvider>
      </ReactQuery>
    </SessionProvider>
  );
}
