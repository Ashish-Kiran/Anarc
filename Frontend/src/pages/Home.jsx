import { useNavigate } from "react-router-dom";
import Hero from "../components/Background/Hero";

function Home() {
  const navigate = useNavigate();

  return (
    <Hero
      onCtaClick={() => navigate("/application")}
    />
  );
}

export default Home;