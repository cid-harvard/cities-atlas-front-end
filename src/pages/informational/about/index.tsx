import React from 'react';
import Helmet from 'react-helmet';
import useFluent from '../../../hooks/useFluent';

const About = () => {
  const getString = useFluent();
  return (
    <div>
      <Helmet>
        <title>{'About | ' + getString('meta-data-title-default-suffix')}</title>
        <meta property='og:title' content={'About | ' + getString('meta-data-title-default-suffix')} />
      </Helmet>
      About the Cityverse
    </div>
  );
};

export default About;
