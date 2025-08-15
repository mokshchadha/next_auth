import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import allowedUsers from "./allowed-google-users.json";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log({user, account, profile });
      
      // Check if the user's email is in the allowed list
      if (account?.provider === 'google' && user.email) {
        const isAllowed = allowedUsers.allowedEmails.includes(user.email);
        if (!isAllowed) {
          console.log(`Access denied for email: ${user.email}`);
          return false; // Deny access
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // First time JWT is created
        token.username = user.email?.split('@')[0] || user.name || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.username) {
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};