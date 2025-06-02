import { UserRole } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      phoneNumber?: string | null;
      image?: string | null;
      role: UserRole;
      managedSchoolId?: number;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    phoneNumber?: string | null;
    image?: string | null;
    role: UserRole;
    managedSchoolId?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    managedSchoolId?: number;
    phoneNumber?: string | null;
  }
}
