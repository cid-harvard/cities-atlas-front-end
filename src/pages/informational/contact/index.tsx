import React from 'react';
import useFluent from '../../../hooks/useFluent';
import Helmet from 'react-helmet';

const Contact = () => {
  const getString = useFluent();
  return (
    <div>
      <Helmet>
        <title>{getString('navigation-contact') + ' | ' + getString('meta-data-title-default-suffix')}</title>
        <meta
          property='og:title'
          content={getString('navigation-contact') + ' | ' + getString('meta-data-title-default-suffix')}
        />
      </Helmet>
      <h1>{getString('contact-us-title')}</h1>
      <p
        dangerouslySetInnerHTML={{__html: getString('contact-us-para-1')}}
      />
      <p
        dangerouslySetInnerHTML={{__html: getString('contact-us-para-2')}}
      />
    </div>
  );
};

export default Contact;
