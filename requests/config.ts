import axios, {
	AxiosResponse,
	AxiosRequestConfig,
	AxiosError,
	AxiosInstance,
} from "axios";

import { toast as notify } from "react-toastify";

const noAuthRoutes = ["/person/login/"];

const isNoAuth: (path: string, routes?: string[]) => boolean = (
	path,
	routes = noAuthRoutes
) => {
	return routes.includes(path);
};

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

// 基本的axios实例
const axiosBase = axios.create({
	baseURL:
		process.env.NODE_ENV === "development"
			? process.env.NEXT_PUBLIC_BASE_URL
			: process.env.NEXT_PUBLIC_API,
});

axiosBase.interceptors.request.use((config: AxiosRequestConfig) => {
	const token = sessionStorage.getItem("token");
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

axiosBase.interceptors.response.use(
	(res: AxiosResponse<IResponse<any>>) => {
		if (!res) {
			return false;
		}
		if (!res.data.success) {
			notify.warning(res.data.errorMessage);
		}
		if (Object.prototype.hasOwnProperty.call(res.data, "token")) {
			sessionStorage.setItem("token", res.data.token as string);
		}
		return res;
	},
	(err: AxiosError<{ errorMessage: string; success: boolean }>) =>
		Promise.reject(err)
);

const axiosMock = axios.create({});

axiosMock.interceptors.response.use(
	(res) => {
		return res;
	},
	(err: AxiosError<{ errorMessage: string; success: boolean }>) =>
		Promise.reject(err)
);

export interface IErrorProps {
	errorMessage: string;
	success: boolean;
}

export interface IResponse<T> {
	data: T;
	errorMessage: string;
	success: boolean;
	token?: string;
}

function httpGenerator(axiosInstance: AxiosInstance) {
	return {
		get<T>(
			url: string,
			config?: AxiosRequestConfig
		): Promise<AxiosResponse<IResponse<T>>> {
			return new Promise((resolve, reject) => {
				axiosInstance
					.get(url, config)
					.then((res: AxiosResponse<IResponse<T>>) => {
						console.log(res);
						resolve(res);
					})
					.catch((err: AxiosError<IErrorProps>) => {
						notify.error(
							`${err.response?.status}: ${err.response?.statusText as string}`
						);
						// handle unlogin state
						if (
							err.response?.status === 401 &&
							isNoAuth(window.location.pathname)
						) {
							setTimeout(() => {
								window.location.href = "/person/login";
							}, 1000);
						}
						return reject(err);
					});
			});
		},
		post<T>(
			url: string,
			data: any,
			config?: AxiosRequestConfig
		): Promise<AxiosResponse<IResponse<T>>> {
			return new Promise((resolve, reject) => {
				axiosInstance
					.post(url, data, config)
					.then((res: AxiosResponse<IResponse<T>>) => resolve(res))
					.catch((err: AxiosError<IErrorProps>) => {
						notify.error(err.response?.data.errorMessage as string);
						if (
							err.response?.status === 401 &&
							isNoAuth(window.location.pathname)
						) {
							setTimeout(() => {
								window.location.href = "/person/login";
							}, 1000);
						}
						return reject(err);
					});
			});
		},
		put<T>(
			url: string,
			data: any,
			config?: AxiosRequestConfig
		): Promise<AxiosResponse<IResponse<T>>> {
			return new Promise((resolve, reject) => {
				axiosInstance
					.put(url, data, config)
					.then((res: AxiosResponse<IResponse<T>>) => resolve(res))
					.catch((err: AxiosError<IErrorProps>) => {
						notify.error(err.response?.data.errorMessage as string);
						if (
							err.response?.status === 401 &&
							isNoAuth(window.location.pathname)
						) {
							setTimeout(() => {
								window.location.href = "/person/login";
							}, 1000);
						}
						return reject(err);
					});
			});
		},
	};
}

const http = httpGenerator(axiosBase);

const httpMock = httpGenerator(axiosMock);

enum enumType {
	BASE = "base",
	MOCK = "mock",
}

export class HttpFactory {
	public static getHttp(type: enumType) {
		switch (type) {
			case enumType.BASE:
				return http;
			case enumType.MOCK:
				return httpMock;
			default:
				return http;
		}
	}
}

export { axiosBase, http, httpMock };
