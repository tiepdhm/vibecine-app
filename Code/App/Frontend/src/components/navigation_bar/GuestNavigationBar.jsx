import {
    ArrowRightStartOnRectangleIcon,
    Cog8ToothIcon,
    UserIcon,
  } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export function GuestNavigationBar({title}) {
    const navigate = useNavigate();
    return (
        <header className="w-full h-[70px] top-0 left-0 bg-[#833228] flex items-center justify-between px-6">
        <button
          onClick={() => navigate('/login')}
          className="font-['Poppins',Helvetica] font-medium text-[#d2c34e] text-5xl bg-transparent border-none p-0 cursor-pointer"
        >
          VibeCine
        </button>

        <div className="font-['Poppins',Helvetica] font-medium text-[#d2c34e] text-5xl absolute left-1/2 transform -translate-x-1/2">
          {title}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <UserIcon className="w-[25px] h-[25px] text-white" />
          <span className="font-['Poppins',Helvetica] font-normal text-white text-xl">
            Guest
          </span>
        </div>
      </header>
    );
}