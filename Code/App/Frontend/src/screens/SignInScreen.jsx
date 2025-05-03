import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon as EyeOffSolid, EyeIcon as EyeSolid} from '@heroicons/react/24/solid';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/authentication_screen/button";
import { Card, CardContent } from "../components/authentication_screen/card";
import { Checkbox } from "../components/authentication_screen/checkbox";
import { Input } from "../components/authentication_screen/input";
import { useCookies } from 'react-cookie';
import {toast} from 'react-toastify';

export const SignInScreen = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [cookies, setCookie] = useCookies(['user']);

  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    
  const login_response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, password})
  });

  const login_data = await login_response.json();

  if (!login_response.ok) {
    toast.error(`${login_data.detail}!`);
      return;
  }
  
  const response = await fetch(`/api/users/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    toast.error(`${data.detail}!`);
      return;
  }

  // Assuming your API returns user data and a token
  setCookie('user', {id: data.id, username: data.username, role: data.role}, { path: '/', maxAge: 86400 });

  toast.success('Login successfully!');

  switch(data.role) {
    case "user":
      navigate('/user_home');
      break;
    case "admin":
      navigate('/admin');
      break;
    case "data_scientist":
      navigate('/model_training');
      break;
  }

  };

  const handleLoginAsGuest = async (event) => {
    event.preventDefault();
    
    const login_response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'username': 'guest',
        'password': 'hello123'
      })
    });
  
    const login_data = await login_response.json();
  
    if (!login_response.ok) {
      toast.error(`${login_data.detail}!`);
        return;
    }
    
    const response = await fetch(`/api/users/guest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      toast.error(`${data.detail}!`);
        return;
    }
  
    // Assuming your API returns user data and a token
    setCookie('user', {id: data.id, username: data.username, role: data.role}, { path: '/', maxAge: 86400 });
  
    toast.success('Login successfully!');
    navigate('/user_home');
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <div className="relative min-h-screen w-full bg-[url(/authentication_screen/360-f-92824780-60mm0mw8h3bdtfyphaaavjyxtqda1asx-1.png)] bg-cover bg-center">
        <div className="mx-auto max-w-[1440px] min-h-screen relative">
          {/* Sign In Form Section */}
          <form onSubmit={handleLogin}>
          <Card className="absolute right-12 top-16 w-[431px] bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              <div className="mb-16">
                <h1 className="font-medium text-black text-3xl font-['Poppins',Helvetica] mb-12">
                  Sign in
                </h1>

                <div className="mb-12">
                  <p className="font-normal text-black text-base font-['Poppins',Helvetica]">
                    If you don&apos;t have an account
                  </p>
                  <p className="font-normal text-black text-base font-['Poppins',Helvetica]">
                    You can{" "}
                    <span className="font-semibold text-[#ff432a] cursor-pointer" onClick={() => navigate('/register')}>
                      Register here !
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Account Input */}
                <div className="space-y-1">
                  <label className="font-medium text-black text-[13px] font-['Poppins',Helvetica]">
                    Account
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <Input
                      className="border-none pl-7 pb-2 focus-visible:ring-0 font-['Poppins',Helvetica]"
                      placeholder="Enter your account name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="absolute w-full h-0.5 bottom-0 left-0 bg-[#ff432a]" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="font-medium text-black text-[13px] font-['Poppins',Helvetica]">
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="border-none pl-7 pb-2 focus-visible:ring-0 font-['Poppins',Helvetica]"
                      placeholder="Enter your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOffSolid className="h-4 w-4 text-black" />
                      ) : (
                        <EyeSolid className="h-4 w-4 text-black" />
                      )}
                    </button>
                    <div className="absolute w-full h-0.5 bottom-0 left-0 bg-black" />
                  </div>
                </div>


                {/* Login Button */}
                <Button type="submit" className="w-full h-[53px] bg-[#ff432a] rounded-[32px] shadow-[0px_4px_26px_#00000040] font-medium text-white text-[17px] font-['Poppins',Helvetica] hover:bg-[#e63a24]">
                  Login
                </Button>

                {/* Login as Guest Button */}
                <Button onClick={handleLoginAsGuest} className=" right-12 top-[600px] w-full h-[53px] bg-[#833228] rounded-[32px] shadow-[0px_4px_26px_#00000040] font-medium text-white text-[17px] font-['Poppins',Helvetica] hover:bg-[#6d2a22]">
                  Login as guest
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
          {/* Left Side Content */}
          <div className="absolute left-0 top-12 w-[758px]">
            <img
              className="absolute w-[568px] h-[567px] top-2.5 left-[183px]"
              alt="Polygon"
              src="/authentication_screen/polygon-1.png"
            />

            <img
              className="absolute w-[586px] h-[416px] top-[58px] left-0 object-cover"
              alt="Movie time flat"
              src="/authentication_screen/movie-time-flat-concept-background-cinema-banner-vector-28695350.png"
            />

            <img
              className="absolute w-[519px] h-[271px] top-0 left-[232px]"
              alt="Vector"
              src="/authentication_screen/vector-1.svg"
            />

            <img
              className="absolute w-[519px] h-[271px] top-[306px] left-[232px]"
              alt="Vector"
              src="/authentication_screen/vector-2.svg"
            />

            <h2 className="absolute top-[190px] left-[426px] font-['Poppins',Helvetica] font-medium text-black text-3xl">
              Welcome to
            </h2>

            <p className="absolute w-[315px] top-[318px] left-[443px] font-['Poppins',Helvetica] font-medium text-black text-2xl">
              An application for <br />
              analyzing the sentiment of movie reviews.
            </p>

            <h1 className="absolute top-[246px] left-64 font-['Poppins',Helvetica] font-medium text-[#ff432a] text-5xl">
              VibeCine
            </h1>
          </div>
        </div>
      </div>
    </main>
  );
};