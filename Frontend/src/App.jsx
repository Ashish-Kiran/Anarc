import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Projects from "./pages/Projects";
import Members from "./pages/Members";
import Navbar from "./components/Navbar";
import PcbCircuitBackground from "./Components/Background/PcbCircuitBackground.jsx";
import ServoSwarmBackground from "./components/Background/ServoSwarmBackground.jsx";
import CircuitBackgroundOne from "./components/Background/CircuitBackgroundOne.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import Footer from "./components/Footer.jsx";
import NeonLoginReplica from "./pages/Login.jsx";


function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {/* {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />} */}
      <PcbCircuitBackground>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<NeonLoginReplica />} />
          <Route path="/Application" element={<NeonLoginReplica/>}/>
        </Routes>
        <Footer />
      </PcbCircuitBackground>
    </BrowserRouter>
  );
}

export default App;