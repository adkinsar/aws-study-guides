import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { IdentityPoolWithCustomMapping } from "./constructs/IdentityPoolWithCustomMapping";

interface IdentityPoolStackProps extends cdk.StackProps {
  clientId: string;
  providerName: string;
  principalTags: { [key: string]: string };
  poolName: string;
}
export class IdentityPoolStack extends cdk.Stack {
  readonly identityPoolId: cdk.CfnOutput;
  constructor(scope: Construct, id: string, props: IdentityPoolStackProps) {
    super(scope, id, props);

    const identityPool = new IdentityPoolWithCustomMapping(
      this,
      "identity-pool",
      {
        clientId: props.clientId,
        providerName: props.providerName,
        principalTags: props.principalTags,
        poolName: props.poolName,
      }
    );
    this.identityPoolId = new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.pool.attrId,
      exportName: "IdentityPoolId", // this value must be unique for all Cloudformation stacks in an account
    });
  }
}
