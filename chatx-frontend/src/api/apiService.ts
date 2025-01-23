import axiosInstance from "./axiosInstance";
import { ILogin, ISignup, IMessage, Message } from "../types/index";

export const signup = async (payload: ISignup) => {
  const response = await axiosInstance.post("/api/users/register", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const signin = async (payload: ILogin) => {
  const response = await axiosInstance.post("/api/users/login", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyToken = async () => {
  const response = await axiosInstance.get("/api/users/verify", {
    withCredentials: true,
  });
  return response.data;
};

export const getConversations = async () => {
  const response = await axiosInstance.get("/api/conversations", {
    withCredentials: true,
  });
  return response.data;
};

export const sendMessage = async (payload: IMessage) => {
  const response = await axiosInstance.post("/api/message", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await axiosInstance.get(
    `/api/conversations/${conversationId}`,
    { withCredentials: true },
  );
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get("/api/users", {
    withCredentials: true,
  });
  return response.data;
};

export const createConversation = async (payload: {
  participants: string[];
  isGroup: boolean;
  groupName: string;
}) => {
  const response = await axiosInstance.post(
    "/api/conversations",
    { ...payload, conversationName: payload.groupName },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/api/users/logout", undefined, {
    withCredentials: true,
  });
  return response.data;
};

export const updateMessage = async (message: Message) => {
  const response = await axiosInstance.put("/api/message", message, {
    withCredentials: true,
  });
  return response.data;
};

export const markAsRead = async (conversationId: string) => {
  const response = await axiosInstance.put(
    `/api/message/read/${conversationId}`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/api/users/all", {
    withCredentials: true,
  });
  return response.data;
};

export const getUserStatus = async (userId: string) => {
  const response = await axiosInstance.get(
    `/api/users/status?userId=${userId}`,
    {
      withCredentials: true,
    },
  );
  return response.data;
};
