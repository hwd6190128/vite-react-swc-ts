import { describe, it, expect, vi } from 'vitest';
import { useUserService } from './UserService';

const mockUsers = [
  { id: 1, name: 'Test User 1' },
  { id: 2, name: 'Test User 2' },
];

describe('useUserService', () => {
  it('should fetch users with injected httpClient', async () => {
    const mockHttpClient = {
      get: vi.fn().mockResolvedValue({ data: mockUsers })
    } as any;
    const service = useUserService(mockHttpClient);
    const users = await service.getUsers();
    expect(users).toEqual(mockUsers);
    expect(mockHttpClient.get).toHaveBeenCalledWith('/users');
  });

  it('should fetch user by id with injected httpClient', async () => {
    const mockHttpClient = {
      get: vi.fn().mockResolvedValue({ data: mockUsers[0] })
    } as any;
    const service = useUserService(mockHttpClient);
    const user = await service.getUserById(1);
    expect(user).toEqual(mockUsers[0]);
    expect(mockHttpClient.get).toHaveBeenCalledWith('/users/1');
  });
}); 