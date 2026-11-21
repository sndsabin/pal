import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { api } from "./api";

const App = () => {
  const [forceWeatherRefresh, setForceWeatherRefresh] = useState(false);

  useEffect(() => {
    const unsubscribeHomeLocationUpdatedEvent = api.onHomeLocationUpdated(async () => {
      setForceWeatherRefresh(true);
    });

    return unsubscribeHomeLocationUpdatedEvent;
  }, []);

  return (
    <div className="h-full w-full overflow-hidden bg-[#02040a] p-0 font-sans text-white">
      <div className="relative flex h-full w-full flex-col overflow-hidden border border-white/15 bg-[#060917]/75 shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-[2px]">
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-48 bg-gradient-to-b from-blue-600/20 via-indigo-900/10 to-transparent" />
        <Outlet
          context={{
            forceWeatherRefresh: forceWeatherRefresh,
          }}
        />
      </div>
    </div>
  );
};

export default App;
