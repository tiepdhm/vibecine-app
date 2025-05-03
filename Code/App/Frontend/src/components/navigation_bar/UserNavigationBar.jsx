import {
    ArrowRightStartOnRectangleIcon,
    Cog8ToothIcon,
    UserIcon,
  } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import {toast} from 'react-toastify';

export function UserNavigationBar({title}) {
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const user = cookies.user;

    const handleLogout = async () => {
      const logout_response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const logout_data = await logout_response.json();

      if (!logout_response.ok) {
            toast.error(`${logout_data.detail}!`);
            return;
      }

      toast.success('Logout successfully!');
      removeCookie('user', { path: '/' });
      
      navigate('/login');
    };
    

    return (
        <header className="w-full h-[70px] bg-[#833228] flex items-center justify-between px-6 relative">
        <button
          onClick={() => navigate('/user_home')}
          className="font-['Poppins',Helvetica] font-medium text-[#d2c34e] text-5xl bg-transparent border-none p-0 cursor-pointer"
        >
          VibeCine
        </button>

        <div className="font-['Poppins',Helvetica] font-medium text-[#d2c34e] text-5xl absolute left-1/2 transform -translate-x-1/2">
          {title}
        </div>

        <div className="flex items-center gap-2 text-white">
            <div className="flex items-center gap-1">
                <button className="flex items-center gap-1 focus:outline-none hover:opacity-80">
                <UserIcon className="w-[25px] h-[25px]" />
                <span className="font-['Poppins',Helvetica] font-normal text-xl">
                    {user.username}
                </span>
                </button>
                <span className="text-xl font-['Poppins',Helvetica]">|</span>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={() => navigate('/setting')} className="flex items-center gap-1 focus:outline-none hover:opacity-80">
                <Cog8ToothIcon className="w-[25px] h-[25px]" />
                <span className="font-['Poppins',Helvetica] font-normal text-xl">
                    Setting
                </span>
                </button>
                <span className="text-xl font-['Poppins',Helvetica]">|</span>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={handleLogout} className="flex items-center gap-1 focus:outline-none hover:opacity-80">
                <ArrowRightStartOnRectangleIcon className="w-[25px] h-[25px]" />
                <span className="font-['Poppins',Helvetica] font-normal text-xl">
                    Log out
                </span>
                </button>
            </div>
        </div>

      </header>
    );
}