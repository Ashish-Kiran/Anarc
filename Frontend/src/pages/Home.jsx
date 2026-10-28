import HeroSection from "../components/Background/Hero";
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useNavigate } from "react-router-dom";
import NotificationButton from "../components/NotificationButton.jsx";
import HeroOne from "../components/HeroOne.jsx";
import HeroTwo from "../components/HeroTwo.jsx";

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar/>
      <HeroSection 
        onCtaClick={() => navigate('/apply')}
      />
      <HeroOne />
      <HeroTwo/>
      <NotificationButton/>
      <Footer/>
    </>
  );
}

export default Home;