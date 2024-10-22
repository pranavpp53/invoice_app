import React from 'react';
import logo from '/images/loaderlogo.png';
import { appLogo } from './appConfig';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-24 h-24 flex justify-center items-center">
        {/* Static circular logo */}
        <img src={appLogo} alt="Logo" className="w-20 h-20 rounded-full" />

        {/* Spinning green border acting as loader around the logo */}
        <div className="absolute w-full h-full border-t-4 border-purple rounded-full animate-spin-slow"></div>
      </div>
    </div>
  );
};

export default Loader;
