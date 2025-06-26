import { httpClient as defaultHttpClient, HttpClient } from '../core/HttpClient';
import { User } from '../types/models';

export function useUserService(http: HttpClient = defaultHttpClient) {
  const getUsers = async (): Promise<User[]> => {
    const res = await http.get<User[]>('/users');
    return res.data;
  };

  const getUserById = async (id: number): Promise<User> => {
    const res = await http.get<User>(`/users/${id}`);
    return res.data;
  };

  // 你可以繼續擴充其他 API 方法
  return {
    getUsers,
    getUserById,
  };
} 