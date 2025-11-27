/**
 * TDD: Tests for Auth Validators
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { loginSchema, registerSchema, registerEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../auth.validator';

describe('Auth Validators - Complete Coverage', () => {
  describe('loginSchema', () => {
    // Happy path
    it('should validate correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('Password123');
      }
    });

    // Edge cases
    it('should accept email with special characters', () => {
      const data = { email: 'user+tag@example.co.uk', password: 'Password123' };
      expect(loginSchema.safeParse(data).success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const data = { email: 'user@example.com', password: 'P@ssw0rd!#$%' };
      expect(loginSchema.safeParse(data).success).toBe(true);
    });

    // Error cases
    it('should reject invalid email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
        '',
      ];
      invalidEmails.forEach(email => {
        const result = loginSchema.safeParse({ email, password: 'Password123' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('email');
        }
      });
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message.toLowerCase();
        expect(errorMessage).toMatch(/required|password/);
      }
    });

    it('should reject missing fields', () => {
      expect(loginSchema.safeParse({}).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'test@test.com' }).success).toBe(false);
      expect(loginSchema.safeParse({ password: 'Password123' }).success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      username: 'johndoe',
      email: 'user@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
    };

    // Happy path
    it('should validate correct registration data', () => {
      expect(registerSchema.safeParse(validData).success).toBe(true);
    });

    // Password validation - uppercase
    it('should reject password without uppercase', () => {
      const data = { ...validData, password: 'lowercase123' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(i => i.message.toLowerCase()).join(' ');
        expect(errorMessages).toMatch(/uppercase|capital/);
      }
    });

    // Password validation - lowercase
    it('should reject password without lowercase', () => {
      const data = { ...validData, password: 'UPPERCASE123' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(i => i.message.toLowerCase()).join(' ');
        expect(errorMessages).toMatch(/lowercase/);
      }
    });

    // Password validation - number
    it('should reject password without number', () => {
      const data = { ...validData, password: 'NoNumbers' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(i => i.message.toLowerCase()).join(' ');
        expect(errorMessages).toMatch(/number|digit/);
      }
    });

    // Username validation
    it('should reject short usernames', () => {
      const data = { ...validData, username: 'ab' };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });

    it('should reject long usernames', () => {
      const data = { ...validData, username: 'A'.repeat(31) };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });

    // Optional fields
    it('should accept valid displayName', () => {
      const data = { ...validData, displayName: 'JohnD' };
      expect(registerSchema.safeParse(data).success).toBe(true);
    });

    it('should reject long displayName', () => {
      const data = { ...validData, displayName: 'A'.repeat(101) };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('registerEmailSchema', () => {
    // Happy path
    it('should validate correct email registration', () => {
      const validData = { email: 'user@example.com' };
      const result = registerEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should accept optional invitationToken', () => {
      const data = { email: 'user@example.com', invitationToken: 'token-123' };
      const result = registerEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.invitationToken).toBe('token-123');
      }
    });

    // Error cases
    it('should reject invalid email', () => {
      const invalidEmails = ['not-email', '@example.com', 'user@'];
      invalidEmails.forEach(email => {
        const result = registerEmailSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing email', () => {
      expect(registerEmailSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'user@example.com' };
      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject invalid email', () => {
      const invalidEmails = ['not-email', '@example.com', 'user@'];
      invalidEmails.forEach(email => {
        const result = forgotPasswordSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing email', () => {
      expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct reset password data', () => {
      const validData = {
        token: 'reset-token-123',
        password: 'NewPassword123',
      };
      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.token).toBe('reset-token-123');
        expect(result.data.password).toBe('NewPassword123');
      }
    });

    it('should reject missing token', () => {
      const result = resetPasswordSchema.safeParse({ password: 'NewPassword123' });
      expect(result.success).toBe(false);
    });

    it('should reject empty token', () => {
      const result = resetPasswordSchema.safeParse({ token: '', password: 'NewPassword123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid password', () => {
      const invalidPasswords = ['short', 'nouppercase123', 'NOLOWERCASE123', 'NoNumbers'];
      invalidPasswords.forEach(password => {
        const result = resetPasswordSchema.safeParse({ token: 'valid-token', password });
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing password', () => {
      const result = resetPasswordSchema.safeParse({ token: 'reset-token-123' });
      expect(result.success).toBe(false);
    });
  });
});

