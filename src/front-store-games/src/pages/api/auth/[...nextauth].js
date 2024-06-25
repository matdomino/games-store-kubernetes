import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: 'games-store-front',
      clientSecret: 'PqiJJZtExNc3RioXuHYvTvFmEByu1jWB',
      issuer: 'http://localhost:8080/realms/games-store',
    }),
  ],

  callbacks: {
    async jwt({token, account}) {
      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token });
      }
      return token;
    },
    async session({session, token}) {
    if(session) {
      session = Object.assign({}, session, {access_token: token.access_token})
      console.log(session);
      }
    return session;
    }
  },
});
