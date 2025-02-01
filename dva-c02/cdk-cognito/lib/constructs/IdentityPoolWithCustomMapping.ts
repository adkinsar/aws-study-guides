import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface IdentityPoolProps {
  clientId: string;
  providerName: string;
  principalTags: { [key: string]: string };
  poolName: string;
}
export class IdentityPoolWithCustomMapping extends Construct {
  readonly pool: cognito.CfnIdentityPool;
  constructor(scope: Construct, id: string, props: IdentityPoolProps) {
    super(scope, id);

    this.pool = new cognito.CfnIdentityPool(this, "identity-pool", {
      allowUnauthenticatedIdentities: true,
      allowClassicFlow: false,
      cognitoIdentityProviders: [
        {
          clientId: props.clientId,
          providerName: props.providerName,
        },
      ],
      identityPoolName: props.poolName,
    });

    new cognito.CfnIdentityPoolPrincipalTag(
      this,
      "identity-pool-attributes-for-access-control",
      {
        identityPoolId: this.pool.ref,
        identityProviderName: props.providerName,
        useDefaults: false,
        principalTags: props.principalTags,
      }
    );
  }
}
