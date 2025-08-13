/**
 * @jest-environment node
 */
import { getSession } from '@/lib/auth';
import { cookies }from 'next/headers';

// Mock the dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/firebase/server', () => ({
  adminAuth: {
    verifySessionCookie: jest.fn(),
  },
}));

describe('Authentication Actions', () => {

  describe('getSession', () => {

    it('should return null if no session cookie is found', async () => {
      // Arrange
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      // Act
      const session = await getSession();

      // Assert
      expect(session).toBeNull();
    });
  });

});
