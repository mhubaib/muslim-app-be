import axios, { AxiosRequestConfig } from 'axios';

export const httpGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.get<T>(url, config);
    return response.data;
  } catch (error) {
    console.error('HTTP GET Error:', error);
    throw error;
  }
};

export const httpPost = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axios.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error('HTTP POST Error:', error);
    throw error;
  }
};
