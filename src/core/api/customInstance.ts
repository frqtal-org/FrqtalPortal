// customInstance.ts
import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({ 
  baseURL: 'https://qa.frqtal.org', 
  timeout: 10000 
});

AXIOS_INSTANCE.defaults.headers.common['frqtal-access-token'] = '';
AXIOS_INSTANCE.defaults.headers.common['Cache-Control'] = 'no-cache';

export const customInstance = async (config: AxiosRequestConfig) => {
  const source = Axios.CancelToken.source();
  
  const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token })
    .then((response) => {
      return response.data;
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        console.error("Error del servidor HTTP:", error.response.status, error.response.data);
        throw error.response.data; // Lanzamos la data del error para que React Query la atrape
      } 
      else if (error.request) {
        console.error("Error de red o Timeout. No hay respuesta:", error.request);
        throw new Error("No se pudo conectar con el servidor.");
      } 
      else {
        console.error("Error desconocido:", error.message);
        throw error;
      }
    });
  
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