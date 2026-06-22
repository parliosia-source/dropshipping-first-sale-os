import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Assistant from '@/pages/Assistant';
import Roadmap from '@/pages/Roadmap';
import ActiveStep from '@/pages/ActiveStep';
import ProjectPage from '@/pages/ProjectPage';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/active-step" element={<ActiveStep />} />
              <Route path="/step/:stepId" element={<ActiveStep />} />
              <Route path="/project" element={<ProjectPage />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App