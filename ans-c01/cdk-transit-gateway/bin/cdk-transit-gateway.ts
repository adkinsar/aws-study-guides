#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkTransitGatewayStack } from "../lib/transit-gateway-stack";
import { VpcStack } from "../lib/vpc-stack";

const app = new cdk.App();

const tgwStack = new CdkTransitGatewayStack(app, "CdkTransitGatewayStack", {
  stackName: "tgw-lab",
});

// Create VPC Stacks
const vpc1Stack = new VpcStack(app, "vpc1", {
  transitGatewayId: tgwStack.transitGateway.ref,
  vpcCidr: "10.0.0.0/24",
  peerVpcCidr: "10.1.0.0/24",
  stackName: "vpc1-lab",
});

const vpc2Stack = new VpcStack(app, "vpc2", {
  transitGatewayId: tgwStack.transitGateway.ref,
  vpcCidr: "10.1.0.0/24",
  peerVpcCidr: "10.0.0.0/24",
  stackName: "vpc2-lab",
});

// Add dependencies
vpc1Stack.addDependency(tgwStack);
vpc2Stack.addDependency(tgwStack);
