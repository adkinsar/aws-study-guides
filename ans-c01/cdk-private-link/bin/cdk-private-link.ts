#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/vpc-stack";

const app = new cdk.App();
new VpcStack(app, "CdkPrivateLinkStack", {
  vpcCidr: "10.0.0.0/27",
  stackName: "PrivateLink-Bedrock",
});
