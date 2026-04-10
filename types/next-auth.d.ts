import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      isPro?: boolean;
      displayName?: string | null;
    };
  }
}
