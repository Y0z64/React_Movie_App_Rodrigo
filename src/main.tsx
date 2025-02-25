import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { MovieProvider } from "./context/MovieProvider.tsx";
import Dashboard from "./Pages/Dashboard.tsx";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <MovieProvider>
          <Toaster />
          <SidebarProvider>
            <Switch>
              <Route path={"/"} component={App} />
              <Route path={"/dashboard"} component={Dashboard} />
            </Switch>
          </SidebarProvider>
        </MovieProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
