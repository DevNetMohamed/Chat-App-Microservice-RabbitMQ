export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string | undefined;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      socketId?: string;
    }
  }
}

export {};
