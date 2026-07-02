export interface AuthenticatedUser  {
  id: decoded.id,
  email: decoded.email,
  role: decoded.role,
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      socketId?: string;
    }
  }
}

export {};
