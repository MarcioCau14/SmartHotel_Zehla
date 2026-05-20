import NextAuth from "next-auth";

const authOptions = {
  providers: [],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
