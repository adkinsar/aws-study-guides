import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class CdkTransitGatewayStack extends cdk.Stack {
  public readonly transitGateway: ec2.CfnTransitGateway;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a transit gateway that will connect to the vpc
    this.transitGateway = new ec2.CfnTransitGateway(this, "lab-tgw", {
      amazonSideAsn: 64512,
      autoAcceptSharedAttachments: "enable",
    });
  }
}
