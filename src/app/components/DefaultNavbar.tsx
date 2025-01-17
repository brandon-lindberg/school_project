import React from 'react';
import Navbar from './Navbar';

const DefaultNavbar: React.FC = () => {
  return <Navbar schools={[]} onRegionClick={() => { }} viewMode="list" />;
};

export default DefaultNavbar;
