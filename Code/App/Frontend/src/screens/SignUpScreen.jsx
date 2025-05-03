import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon as EyeOffSolid, EyeIcon as EyeSolid} from '@heroicons/react/24/solid';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/authentication_screen/button";
import { Card, CardContent } from "../components/authentication_screen/card";
import { Input } from "../components/authentication_screen/input";
import {toast} from 'react-toastify';

export const SignUpScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const signup_response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": `${username}`,
          "email": "",
          "first_name": "",
          "last_name": "",
          "company": "",
          "is_active": true,
          "role": "user",
          "password": `${password}`,
          "confirm_password": `${confirmPassword}`
        })
      });

      const signup_data = await signup_response.json();

      if (!signup_response.ok) {
        toast.error(`${signup_data.detail}!`);
        return;
      }
      toast.success('Signup successfully!');

      navigate('/login')
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  } 
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <div className="relative min-h-screen w-full bg-[url(/authentication_screen/360-f-92824780-60mm0mw8h3bdtfyphaaavjyxtqda1asx-1.png)] bg-cover bg-center">
        <div className="mx-auto max-w-[1440px] min-h-screen relative">
          {/* Left side with illustrations and welcome text */}
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

          {/* Right side with sign up form */}
          <form onSubmit={handleSignUp}>
          <Card className="absolute right-12 top-16 w-[431px] bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              <div className="space-y-6">
                {/* Header section */}
                <div className="mb-16">
                <h1 className="font-medium text-black text-3xl font-['Poppins',Helvetica] mb-12">
                  Sign up
                </h1>

                <div className="mb-12">
                  <p className="font-normal text-black text-base font-['Poppins',Helvetica]">
                    If you already have an account
                  </p>
                  <p className="font-normal text-black text-base font-['Poppins',Helvetica]">
                    You can{" "}
                    <span className="font-semibold text-[#ff432a] cursor-pointer" onClick={() => navigate('/login')}>
                      Login here !
                    </span>
                  </p>
                </div>
              </div>

                {/* Username field */}
                <div className="space-y-1">
                <label className="font-medium text-black text-[13px] font-['Poppins',Helvetica]">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2">
                      <UserIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    </div>
                    <Input
                      className="border-none pl-7 pb-2 focus-visible:ring-0 font-['Poppins',Helvetica]"
                      placeholder="Enter your User name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="absolute w-full h-0.5 bottom-0 left-0 bg-[#ff432a]" />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                <label className="font-medium text-black text-[13px] font-['Poppins',Helvetica]">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2">
                      <LockClosedIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="border-none pl-7 pb-2 focus-visible:ring-0 font-['Poppins',Helvetica]"
                      placeholder="Enter your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffSolid className="h-4 w-4 text-black" />
                      ) : (
                        <EyeSolid className="h-4 w-4 text-black" />
                      )}
                    </div>
                    <div className="absolute w-full h-0.5 bottom-0 left-0 bg-black" />
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1">
                <label className="font-medium text-black text-[13px] font-['Poppins',Helvetica]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2">
                      <LockClosedIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="border-none pl-7 pb-2 focus-visible:ring-0 font-['Poppins',Helvetica]"
                      placeholder="Confirm your Password"
                      value={confirmPassword}
                      onChange={(e) => setconfirmPassword(e.target.value)}
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffSolid className="h-4 w-4 text-black" />
                      ) : (
                        <EyeSolid className="h-4 w-4 text-black" />
                      )}
                    </div>
                    <div className="absolute w-full h-0.5 bottom-0 left-0 bg-black" />
                  </div>
                </div>

                {/* Register button */}
                <Button type="submit" className="w-full h-[43px] bg-[#ff432a] rounded-[32px] shadow-[0px_4px_26px_#00000040] font-medium text-white text-[17px] font-['Poppins',Helvetica] hover:bg-[#e63a24]">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
          </form>
        </div>
      </div>
    </main>
  );
};