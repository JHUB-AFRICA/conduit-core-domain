import Hero from "../components/home/Hero";
import WeatherDataPortal from "../components/home/WeatherDataPortal";
import ApiEndpoints from "../components/home/ApiEndpoints";
import SmartHydrology from "../components/home/SmartHydrology";
import LivestockAlerts from "../components/home/LivestockAlerts";
import GetStarted from "../components/home/GetStarted";
import AlertsIntro from "../components/home/AlertsIntro";

export default function Home() {
  return (
    <>
      <a id="top" />
      <Hero />
      <WeatherDataPortal />
      <ApiEndpoints />
      <AlertsIntro />
      <SmartHydrology />
      <LivestockAlerts />
      <GetStarted />
      <div className="h-8 bg-[#e8e4d8]"></div>
    </>
  );
}
