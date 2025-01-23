import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

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
              take: 1,
              select: {
                school_id: true,
              },
            },
          },
        });

        console.log('Database user:', JSON.stringify(user, null, 2));

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          return null;
        }

        const authUser = {
          id: user.user_id.toString(),
          email: user.email,
          name: user.first_name ? `${user.first_name} ${user.family_name || ''}` : null,
          role: user.role,
          managedSchoolId: user.managedSchools[0]?.school_id,
        };

        console.log('Auth user:', JSON.stringify(authUser, null, 2));
        return authUser;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.managedSchoolId = user.managedSchoolId;
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token) {
        session.user.role = token.role;
        session.user.managedSchoolId = token.managedSchoolId;
      }
      return session;
    },
  },
};
