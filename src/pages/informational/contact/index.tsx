import React from 'react';
import useFluent from '../../../hooks/useFluent';

const Contact = () => {
  const getString = useFluent();
  return (
    <div>
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
