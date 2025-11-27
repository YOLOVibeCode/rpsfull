/**
 * Player Utils Tests
 * 
 * TDD: Tests for shared player utility functions
 */

import { getOrCreatePlayer, PlayerInfo } from '../PlayerUtils';
import { IUserRepository, IPlayerRepository, IUser, IPlayer, UserRole } from '@rpsfull-platform/contracts';

describe('PlayerUtils', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPlayerRepository: jest.Mocked<IPlayerRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      usernameExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockPlayerRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    } as any;
  });

  describe('getOrCreatePlayer', () => {
    const validPlayerInfo: PlayerInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    it('should create new user and player when neither exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.usernameExists.mockResolvedValue(false);
      
      const newUser: IUser = {
        id: 'user-1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
        role: UserRole.PLAYER,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPlayer: IPlayer = {
        id: 'player-1',
        userId: 'user-1',
        name: 'John Doe',
        displayName: 'John',
        email: 'john.doe@example.com',
        level: 1,
        experience: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockResolvedValue(newUser);
      mockUserRepository.update.mockResolvedValue({ ...newUser, isEmailVerified: true });
      mockPlayerRepository.create.mockResolvedValue(newPlayer);

      // Act
      const result = await getOrCreatePlayer(validPlayerInfo, mockUserRepository, mockPlayerRepository);

      // Assert
      expect(result.userCreated).toBe(true);
      expect(result.playerCreated).toBe(true);
      expect(result.player.id).toBe('player-1');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockPlayerRepository.create).toHaveBeenCalled();
    });

    it('should use existing user and create player when user exists but no player', async () => {
      // Arrange
      const existingUser: IUser = {
        id: 'user-1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPlayer: IPlayer = {
        id: 'player-1',
        userId: 'user-1',
        name: 'John Doe',
        displayName: 'John',
        email: 'john.doe@example.com',
        level: 1,
        experience: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockPlayerRepository.findByUserId.mockResolvedValue(null);
      mockPlayerRepository.create.mockResolvedValue(newPlayer);

      // Act
      const result = await getOrCreatePlayer(validPlayerInfo, mockUserRepository, mockPlayerRepository);

      // Assert
      expect(result.userCreated).toBe(false);
      expect(result.playerCreated).toBe(true);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockPlayerRepository.create).toHaveBeenCalled();
    });

    it('should return existing player when both user and player exist', async () => {
      // Arrange
      const existingUser: IUser = {
        id: 'user-1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingPlayer: IPlayer = {
        id: 'player-1',
        userId: 'user-1',
        name: 'John Doe',
        displayName: 'John',
        email: 'john.doe@example.com',
        level: 1,
        experience: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockPlayerRepository.findByUserId.mockResolvedValue(existingPlayer);

      // Act
      const result = await getOrCreatePlayer(validPlayerInfo, mockUserRepository, mockPlayerRepository);

      // Assert
      expect(result.userCreated).toBe(false);
      expect(result.playerCreated).toBe(false);
      expect(result.player.id).toBe('player-1');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockPlayerRepository.create).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      // Arrange
      const playerInfo: PlayerInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.usernameExists.mockResolvedValue(false);

      const newUser: IUser = {
        id: 'user-1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
        role: UserRole.PLAYER,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPlayer: IPlayer = {
        id: 'player-1',
        userId: 'user-1',
        name: 'John Doe',
        displayName: 'John',
        email: 'john.doe@example.com',
        level: 1,
        experience: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockResolvedValue(newUser);
      mockUserRepository.update.mockResolvedValue({ ...newUser, isEmailVerified: true });
      mockPlayerRepository.create.mockResolvedValue(newPlayer);

      // Act
      await getOrCreatePlayer(playerInfo, mockUserRepository, mockPlayerRepository);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const invalidPlayerInfo: PlayerInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
      };

      // Act & Assert
      await expect(
        getOrCreatePlayer(invalidPlayerInfo, mockUserRepository, mockPlayerRepository)
      ).rejects.toThrow('Player email cannot be empty');
    });

    it('should handle missing firstName/lastName gracefully', async () => {
      // Arrange
      const playerInfo: PlayerInfo = {
        firstName: '',
        lastName: '',
        email: 'test@example.com',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.usernameExists.mockResolvedValue(false);

      const newUser: IUser = {
        id: 'user-1',
        username: 'test',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: UserRole.PLAYER,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPlayer: IPlayer = {
        id: 'player-1',
        userId: 'user-1',
        name: 'test',
        displayName: 'test',
        email: 'test@example.com',
        level: 1,
        experience: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockResolvedValue(newUser);
      mockUserRepository.update.mockResolvedValue({ ...newUser, isEmailVerified: true });
      mockPlayerRepository.create.mockResolvedValue(newPlayer);

      // Act
      const result = await getOrCreatePlayer(playerInfo, mockUserRepository, mockPlayerRepository);

      // Assert
      expect(result.player.name).toBe('test'); // Should use email prefix
    });
  });
});

