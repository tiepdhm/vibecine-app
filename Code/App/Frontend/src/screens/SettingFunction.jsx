import {
    BriefcaseIcon,
    CornerUpLeftIcon,
    HomeIcon,
    KeyIcon,
    LogOutIcon,
    MailIcon,
    SettingsIcon,
    UserCircleIcon,
    UserIcon,
    UsersIcon,
  } from "lucide-react";
  import React from "react";
  import { Button } from "../components/setting/button";
  import { Card, CardContent } from "../components/setting/card";
  import { Input } from "../components/setting/input";
  import { Separator } from "../components/setting/separator";
import { UserNavigationBar } from "../components/navigation_bar/UserNavigationBar";
import { useCookies } from 'react-cookie';
import {toast} from 'react-toastify';
import { AdminNavigationBar } from "../components/navigation_bar/AdminNavigationBar";
import { DataScentistNavigationBar } from "../components/navigation_bar/DataScentistNavigationBar";

  export const SettingFunction = () => {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [firstname, setFirstname] = React.useState('');
    const [lastname, setLastname] = React.useState('');
    const [company, setCompany] = React.useState('');
    const [currentPassword, setCurrentPassword] = React.useState(''); 
    const [password, setPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [cookies, setCookie] = useCookies(['user']);
    const user = cookies.user;

    React.useEffect(() => {
      const loadUser = async () => {
        const get_user_response = await fetch(`/api/users/${user.username}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
            
            const user_result = await get_user_response.json();
          
            if (!get_user_response.ok) {
              toast.error(`${user_result.detail}!`);
            }

        setUsername(user_result.username);
        setEmail(user_result.email);
        setFirstname(user_result.first_name)
        setLastname(user_result.last_name)
        setCompany(user_result.company)
        setCurrentPassword(user_result.password)
      }

      loadUser();
    }, []);

    const handleSetting = async (event) => {
      event.preventDefault();
      var updateParams = {
        email,
        "first_name": firstname,
        "last_name": lastname,
       company
      }

      if (password && newPassword && confirmPassword) {
        if (password !== currentPassword) {
          toast.error("Current password is incorrect.");
          return;
        }

        if (password === newPassword) {
          toast.error("New password must be different from the current password.");
          return;
        }
      
        if (newPassword !== confirmPassword) {
          toast.error("Confirm password does not match the new password.");
          return;
        }
      
        updateParams.password = newPassword;
      }
      
        
      const update_response = await fetch('/api/users/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateParams)
        });

        const update_data = await update_response.json();
        if (!update_response.ok) {
          toast.error(`${update_data.detail}!`);
            return;
        }

      toast.success('Update successfully!');
    }
    const renderHeader = (type) => {
      switch (type) {
        case "user":
          return <UserNavigationBar title="SETTING"/>
        case "admin":
          return <AdminNavigationBar title="SETTING"/>
        case "data_scientist":
          return <DataScentistNavigationBar title="SETTING"/>
        default:
          return <div>Unknown type</div>;
      }
    };
    return (
        <div className="bg-white flex flex-row justify-center w-screen h-screen">
            <div className="bg-white w-full h-full relative">
          {/* Header */}
          {renderHeader(user.role)}

            {/* Main content */}
            <main className="p-6">
              <form onSubmit={handleSetting}>
              {/* Personal information card */}
              <div className="flex p-4 gap-6 overflow-hidden justify-center">
              <Card className=" w-[1000px] h-[500px] rounded-[20px] border border-solid border-[#817d7d]">
                <CardContent className="p-0">
                  <div className="p-5">
                    <h2 className="font-['Inter',Helvetica] font-bold text-black text-[32px] text-center mb-2">
                      Personal information
                    </h2>
                    <Separator className="mb-4" />
  
                    <div className="grid grid-cols-2 gap-6">
                      {/* Username field */}
                      <div>
                        <label className="block font-['Inter',Helvetica] font-bold text-black text-2xl mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <UsersIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10" />
                          <Input
                            readonly 
                            className="pl-14 h-[70px] bg-[#817d7d85] rounded-[5px] pointer-events-none border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl"
                            value={username}
                          />
                        </div>
                      </div>
  
                      {/* Email field */}
                      <div>
                        <label className="block font-['Inter',Helvetica] font-bold text-black text-2xl mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <MailIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10" />
                          <Input
                            className="pl-14 h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
  
                      {/* First name field */}
                      <div>
                        <label className="block font-['Inter',Helvetica] font-bold text-black text-xl mb-2">
                          First name
                        </label>
                        <div className="relative">
                          <UserCircleIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10" />
                          <Input
                            className="pl-14 h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                          />
                        </div>
                      </div>
  
                      {/* Last name field */}
                      <div>
                        <label className="block font-['Inter',Helvetica] font-bold text-black text-xl mb-2">
                          Last name
                        </label>
                        <div className="relative">
                          <HomeIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10" />
                          <Input
                            className="pl-14 h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
  
                    {/* Company field */}
                    <div className="mt-6">
                      <label className="block font-['Inter',Helvetica] font-bold text-black text-2xl mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <BriefcaseIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10" />
                        <Input
                          className="pl-14 h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
              {/* Password change card */}
              <div className="flex p-4 gap-6 overflow-hidden justify-center">
              <Card className="w-[1000px] mt-3 rounded-[20px] border border-solid border-[#817d7d]">
                <CardContent className="p-0">
                  <div className="p-5">
                    <h2 className="font-['Inter',Helvetica] font-bold text-black text-[32px] text-center mb-2">
                      Change Password
                    </h2>
                    <Separator className="mb-4" />
  
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Current Password"
                          className="h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl w-full"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="New Password"
                          className="h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl w-full"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="h-[70px] bg-[#817d7d85] rounded-[5px] border border-solid border-[#817d7d] font-['Inter',Helvetica] font-bold text-black text-2xl w-full"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              {/* Save button and navigation */}
              <div className="flex justify-center mt-4 relative">
                <Button type="submit" className="w-[149px] h-[52px] bg-[#ff0000] rounded-[20px] border border-solid shadow-[0px_4px_4px_#00000040] font-['Inter',Helvetica] font-bold text-white text-2xl">
                  SAVE
                </Button>
              </div>
              </form>
            </main>
          </div>
      </div>
    );
  };