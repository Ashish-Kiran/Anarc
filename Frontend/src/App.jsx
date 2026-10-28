import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Projects from "./pages/ProjectsPage.jsx";
import Members from "./pages/Members";
import PcbCircuitBackground from "./components/Background/PcbCircuitBackground.jsx";
import ServoSwarmBackground from "./components/Background/ServoSwarmBackground.jsx";
import CircuitBackgroundOne from "./components/Background/CircuitBackgroundOne.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import NeonLoginReplica from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ApplyPage from "./pages/Apply.jsx";
import Legacy from "./pages/Legacy.jsx";
import InviteAccept from "./pages/Inviteaccept.jsx";
import ANARCBackground from "./components/Background/ANARCBackground.jsx";
import Cursorgridapp from "./components/Background/Cursorgridapp.jsx";
import MemberDashboard from "./pages/MemberDashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Cursorgridapp>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<NeonLoginReplica />} />
          <Route path="/Application" element={<NeonLoginReplica />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="invite/accept" element={<InviteAccept />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </Cursorgridapp>
    </BrowserRouter>
  );
}

export default App;