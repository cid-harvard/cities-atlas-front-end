import React from 'react';
import {NavigationContainer} from '../../../styling/GlobalGrid';

const SideNavigation = () => {
  return (
    <NavigationContainer>
      <ul>
        <li>What is my city's economic position?</li>
        <li>What cities own/host subsidaries in and from my city?</li>
        <li>What is my city good at?</li>
        <li>What cities should I compare myself to?</li>
        <li>What industry can my city move to?</li>
        <li>Quick facts &amp; summary</li>
      </ul>
    </NavigationContainer>
  );
};

export default SideNavigation;
