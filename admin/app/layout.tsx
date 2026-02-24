import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import StoreProvider from "./store/StoreProvider";
import AuthHydrator from "./components/AuthHydrator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthHydrator>{children}</AuthHydrator>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
