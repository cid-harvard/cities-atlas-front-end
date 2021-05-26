import React from 'react';
import useFluent from '../../../hooks/useFluent';
import Helmet from 'react-helmet';

const Faq = () => {
  const getString = useFluent();
  return (
    <div>
      <Helmet>
        <title>{getString('navigation-faq') + ' | ' + getString('meta-data-title-default-suffix')}</title>
        <meta
          property='og:title'
          content={getString('navigation-faq') + ' | ' + getString('meta-data-title-default-suffix')}
        />
      </Helmet>
      <h1>{getString('faq-title')}</h1>
    </div>
  );
};

export default Faq;
