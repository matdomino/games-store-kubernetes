import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

import axios from 'axios';

async function refreshAccessToken(token) {
  try {
    const url = 'http://localhost:8080/realms/games-store/protocol/openid-connect/token';

    const response = await axios.post(url, new URLSearchParams({
      client_id: 'games-store-front',
      client_secret: 'PqiJJZtExNc3RioXuHYvTvFmEByu1jWB',
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const refreshedTokens = response.data;

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Date.now() + 300 * 1000,
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: 'games-store-front',
      clientSecret: 'PqiJJZtExNc3RioXuHYvTvFmEByu1jWB',
      issuer: 'http://localhost:8080/realms/games-store',
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        return {
          access_token: account.access_token,
          expires_at: account.expires_at * 1000,
          refresh_token: account.refresh_token,
          email: profile.email,
        };
      }

      if (Date.now() < token.expires_at) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.refresh_token = token.refresh_token;
      session.access_token = token.access_token;
      session.error = token.error;
      return session;
    }
  }
});
