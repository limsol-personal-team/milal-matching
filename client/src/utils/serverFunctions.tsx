import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { UserTypes } from "./constants";

export const postSignInRecord = async (data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_record",
    method: "POST",
    data: data
  }
  return callExternalApi(config);
};

export const getSignInToken = async (authToken: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_token",
    method: "GET"
  }
  return callExternalApi(config, authToken);
};

export const postSignInToken = async (authToken: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_token",
    method: "POST"
  }
  return callExternalApi(config, authToken);
};

export const checkSignInToken = async (token: any) => {
  const config: AxiosRequestConfig = {
    url: `/api/auth/sign_in_check?token=${token}`,
    method: "GET"
  }
  return callExternalApi(config);
};

export const postUserData = async (authToken: any, data: any, userType: UserTypes) => {
  const config: AxiosRequestConfig = {
    url: `/api/${userType}`,
    method: "POST",
    data: data
  }
  return callExternalApi(config, authToken);
}

export const getUserData = async (authToken: any, userType: UserTypes) => {
  const config: AxiosRequestConfig = {
    url: `/api/${userType}`,
    method: "GET"
  }
  return callExternalApi(config, authToken);
}

export const postMatchData = async (authToken: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/records/match",
    method: "POST",
    data: data
  }
  return callExternalApi(config, authToken);
}

export const postUnmatchData = async (authToken: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/records/unmatch",
    method: "POST",
    data: data
  }
  return callExternalApi(config, authToken);
}

export const getMatchData = async (authToken: any, queryString: any) => {
  let url = "/api/records";
  if (queryString) {
    url += `?${queryString}`
  }
  const config: AxiosRequestConfig = {
    url: url,
    method: "GET"
  }
  return callExternalApi(config, authToken);
}

export const getVolunteerHours = async (authToken: any, volunteerId: any) => {
  let url = "/api/volunteer_hours";
  if (volunteerId) {
    url += `?volunteer=${volunteerId}`
  }
  const config: AxiosRequestConfig = {
    url: url,
    method: "GET"
  }
  return callExternalApi(config, authToken);
}

export const getEmailAccounts = async (authToken: any, queryString: any) => {
  let url = "/api/email_accounts";
  if (queryString) {
    url += `?${queryString}`
  }
  const config: AxiosRequestConfig = {
    url: url,
    method: "GET"
  }
  return callExternalApi(config, authToken);
}

export const patchEmailAccounts = async (authToken: any, emailId: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: `/api/email_accounts/${emailId}`,
    method: "PATCH",
    data: data
  }
  return callExternalApi(config, authToken);
}

export const postVolunteerHoursBulkCreate = async ( authToken: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/volunteer_hours/bulk_create",
    method: "POST",
    data: data
  }
  return callExternalApi(config, authToken);
}

export const postClearSerializerCache = async ( authToken: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/cache/clear_serializer",
    method: "POST"
  }
  return callExternalApi(config, authToken);
}

const callExternalApi = async (config: AxiosRequestConfig, authToken?: any) => {
  try {
    config.headers = config.headers || {};
    config.headers["content-type"] = "application/json";
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    const response: AxiosResponse = await axios(config);
    const { data } = response;
    return {
      data,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}