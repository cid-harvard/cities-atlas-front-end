import React from 'react';
import useFluent from '../../../hooks/useFluent';

const AboutTeam = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString('about-team-title')}</h1>
      <div dangerouslySetInnerHTML={{__html: getString('about-team-html')}} />
    </>
  );
};

export default AboutTeam;
