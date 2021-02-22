module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "mysql",
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "boilerplateEco"),
        username: env("DATABASE_USERNAME", "root"), // not work in selfpaths user
        password: env("DATABASE_PASSWORD", "password"),
      },
      options: {},
    },
  },
});
