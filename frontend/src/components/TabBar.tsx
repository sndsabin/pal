import { NavLink } from "react-router-dom";

import type { Tab } from "../types";

interface Props {
  tabs: Tab[];
}

const TabBar = ({ tabs }: Props) => {
  return (
    <nav aria-label="Sections" className="relative z-10 shrink-0 px-6 pt-3">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/15 bg-[#0b1022] p-1">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                isActive ? "bg-white/20 text-white shadow" : "text-blue-200/60 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-400" : ""}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
