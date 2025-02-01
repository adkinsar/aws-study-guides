import { expect, test, describe } from "bun:test";
import { UserPoolWithResourceServer } from "../lib/constructs/UserPoolWithResourceServer";

describe("resource server creation", () => {
  const scopesDefined = [
    {
      identifier: "a3",
      name: "a3-api",
      scopes: [
        {
          name: "read",
          description: "Get all pets",
        },
      ],
    },
  ];

  test.each(scopesDefined)("%j scopes are included", (server) => {
    const options = UserPoolWithResourceServer.createResourceServerOptions(
      server.identifier,
      server.name,
      server.scopes
    );
    expect(options).toEqual(
      expect.objectContaining({
        identifier: expect.any(String),
        userPoolResourceServerName: expect.any(String),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            scopeName: expect.any(String),
            scopeDescription: expect.any(String),
          }),
        ]),
      })
    );
  });

  const scopesUndefined = [
    {
      identifier: "a3",
      name: "a3-api",
    },
  ];

  test.each(scopesUndefined)("%j scopes are omitted", (server) => {
    const options = UserPoolWithResourceServer.createResourceServerOptions(
      server.identifier,
      server.name
    );
    expect(options).toEqual(
      expect.objectContaining({
        identifier: expect.any(String),
        userPoolResourceServerName: expect.any(String),
      })
    );
  });
});
