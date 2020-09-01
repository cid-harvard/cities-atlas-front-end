import {createContext, useState, useEffect} from 'react';
import debounce from 'lodash/debounce';

interface IAppContext {
  windowDimensions: {width: number, height: number};
}

const initialWindowDimension = {width: window.innerWidth, height: window.innerHeight};
export default createContext<IAppContext>({
  windowDimensions: initialWindowDimension,
});

export const useWindowWidth = () => {
  const [windowDimensions, setWindowDimensions] = useState<IAppContext['windowDimensions']>(initialWindowDimension);

  useEffect(() => {
    const updateWindowDimensions = debounce(() => {
      setWindowDimensions({width: window.innerWidth, height: window.innerHeight});
    }, 500);
    window.addEventListener('resize', updateWindowDimensions);
    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  return windowDimensions;
};
