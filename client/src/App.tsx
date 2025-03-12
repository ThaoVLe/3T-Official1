import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import NewEntry from './pages/new-entry';
import ViewEntry from './pages/view-entry';
import EditEntry from './pages/edit-entry';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/lib/theme-provider";
import { ScrollToTop } from "./components/scroll-to-top";


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<NewEntry />} />
            <Route path="/entries/:id" element={<ViewEntry />} />
            <Route path="/entries/:id/edit" element={<EditEntry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;