import type { Request } from 'express';
import type { User } from '../users/entities/user.entity';

export type AuthUser = Pick<User, 'id' | 'fullName' | 'email' | 'role'>;
export type AuthRequest = Request & { user: AuthUser };
