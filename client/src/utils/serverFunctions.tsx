import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const postSignInRecord = async (data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_record",
    method: "POST",
    data: data,
    headers: {
      "content-type": "application/json",
    },
  }
  return callExternalApi(config);
};

export const getSignInToken = async (authToken: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_token",
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
};

export const postSignInToken = async (authToken: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/auth/sign_in_token",
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
};

export const checkSignInToken = async (token: any) => {
  const config: AxiosRequestConfig = {
    url: `/api/auth/sign_in_check?token=${token}`,
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  }
  return callExternalApi(config);
};

export const postVolunteerData = async (authToken: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/volunteers",
    method: "POST",
    data: data,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
}

export const getVolunteerData = async (token: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/volunteers",
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
  return callExternalApi(config);
}

export const getVolunteerHours = async (authToken: any, volunteerId: any) => {
  let url = "/api/volunteer_hours";
  if (volunteerId) {
    url += `?volunteer=${volunteerId}`
  }
  const config: AxiosRequestConfig = {
    url: url,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
}

export const getEmailAccounts = async (authToken: any, queryString: any) => {
  let url = "/api/email_accounts";
  if (queryString) {
    url += `?volunteer=${queryString}`
  }
  const config: AxiosRequestConfig = {
    url: url,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
}

export const patchEmailAccounts = async (authToken: any, emailId: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: `/api/email_accounts/${emailId}`,
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
}

export const postVolunteerHoursBulkCreate = async ( authToken: any, data: any) => {
  const config: AxiosRequestConfig = {
    url: "/api/volunteer_hours/bulk_create",
    method: "POST",
    data: data,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }
  return callExternalApi(config);
}

const callExternalApi = async (config: AxiosRequestConfig) => {
  try {
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