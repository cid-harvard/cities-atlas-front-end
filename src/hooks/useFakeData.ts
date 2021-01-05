import {useEffect, useState} from 'react';

interface Output<T> {
  loading: boolean;
  error: undefined | any;
  data: T | undefined;
}

function useFakeData<T>(data: T): Output<T> {


  const [output, setOutput] = useState<Output<T>>({loading: true, error: undefined, data: undefined});

  useEffect(() => {
    setTimeout(() => {
      setOutput({loading: false, error: undefined, data});
    }, 200);
  }, [data]);

  return output;
}

export default useFakeData;