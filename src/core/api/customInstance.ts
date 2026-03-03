// custom-instance.ts
import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

/* export const AXIOS_INSTANCE = Axios.create({ baseURL: 'https://prod.frqtal.org' }); */
export const AXIOS_INSTANCE = Axios.create({ baseURL: 'https://qa.frqtal.org' });

AXIOS_INSTANCE.defaults.headers.common['frqtal-access-token'] = '';
AXIOS_INSTANCE.defaults.headers.common['Cache-Control'] = 'no-cache';

export const customInstance = (config: AxiosRequestConfig) => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(({ data }: any) => data);
  
  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };
  
  return promise;
};

export function handleSetTokenToAxiosInstance(token: any) {
  AXIOS_INSTANCE.defaults.headers.common['frqtal-access-token'] = token;
};

export type ErrorType<Error> = AxiosError<Error>;
