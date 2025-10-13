import React from 'react';
import LogoImage from '../../assets/LogoPepeSingle.webp';
import SchriftImage from '../../assets/PepeSchrift.png';
import { Link } from 'react-router'

export const Logo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <Link to="/home" className="flex items-center">
    <img
      src={LogoImage}
      alt="Pepe Logo"
      width={50}
      height={50}
      {...props}
    />
    <img
      src={SchriftImage}
      alt="Pepe Schriftzug"
      width={85}
      className="ml-2 h-auto hidden md:block"
    />
  </Link>
);
