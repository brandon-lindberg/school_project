import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      managedSchools?: Array<{ school_id: number }>;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    managedSchools?: Array<{ school_id: number }>;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    managedSchools?: Array<{ school_id: number }>;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        console.log('[authorize] Fetching user with email:', credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            user_id: true,
            email: true,
            password_hash: true,
            first_name: true,
            family_name: true,
            role: true,
            managedSchools: {
              select: {
                school_id: true,
              },
            },
          },
        });

        console.log('[authorize] Raw database response:', JSON.stringify(user, null, 2));
        console.log('[authorize] User role from database:', user?.role);

        if (!user) {
          console.log('User not found');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          console.log('Invalid password');
          return null;
        }

        const authUser = {
          id: user.user_id.toString(),
          email: user.email,
          name: user.first_name ? `${user.first_name} ${user.family_name || ''}` : null,
          role: user.role,
          managedSchools: user.managedSchools,
        };

        console.log('[authorize] Final auth user object:', JSON.stringify(authUser, null, 2));
        console.log('[authorize] Role being returned:', authUser.role);
        return authUser;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 60, // Set session to expire in 1 minute (for testing)
  },
  pages: {
    signIn: '/login',
    signOut: '/list',
  },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      console.log('[jwt] Incoming token:', JSON.stringify(token, null, 2));
      console.log('[jwt] Incoming user:', JSON.stringify(user, null, 2));
      console.log('[jwt] Trigger:', trigger);

      if (user) {
        console.log('[jwt] Setting token role from user:', user.role);
        token.role = user.role;
        token.managedSchools = user.managedSchools;
      }

      // Always refresh user data from database
      console.log('[jwt] Refreshing user data from database');
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: {
          role: true,
          managedSchools: {
            select: {
              school_id: true,
            },
          },
        },
      });

      console.log('[jwt] Fresh database user:', JSON.stringify(dbUser, null, 2));

      if (dbUser) {
        console.log('[jwt] Updating token role from database:', dbUser.role);
        token.role = dbUser.role;
        token.managedSchools = dbUser.managedSchools;
      }

      console.log('[jwt] Final token:', JSON.stringify(token, null, 2));
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      console.log('[session] Incoming session:', JSON.stringify(session, null, 2));
      console.log('[session] Incoming token:', JSON.stringify(token, null, 2));

      if (token) {
        console.log('[session] Setting session role from token:', token.role);
        session.user.role = token.role;
        session.user.managedSchools = token.managedSchools;
      }

      console.log('[session] Final session:', JSON.stringify(session, null, 2));
      return session;
    },
  },
};
