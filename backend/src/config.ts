export const config = {
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/alsdao?retryWrites=true&w=majority",
  },
  server: {
    port: process.env.PORT || 3001,
  },
} as const;

export type Config = typeof config;
