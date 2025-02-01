import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  UserPoolWithResourceServer,
  type UserPoolProps,
} from "./constructs/UserPoolWithResourceServer";

export class UserPoolStack extends cdk.Stack {
  readonly userPool: UserPoolWithResourceServer;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolProps: UserPoolProps = {
      baseLogicalId: "a2",
      clientName: "web-frontend",
      domainPrefix: "a2-technology",
      groups: ["engineering", "customer"],
      oAuthCallbackUrls: [
        "https://foobar.com", // make a parameter, secret, or env?
        "https://localhost/",
      ],
      resourceServer: {
        identifier: "a2",
        name: "a2-api",
        scopes: [
          {
            name: "read",
            description: "Get all pets",
          },
        ],
      },
      userPoolName: "a2-user-pool",
    };
    this.userPool = new UserPoolWithResourceServer(
      this,
      "a2-userpool",
      userPoolProps
    );
  }
}
