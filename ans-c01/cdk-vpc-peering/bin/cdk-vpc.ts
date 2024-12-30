#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpnVpcStack } from "../lib/stacks/vpn-vpc-stack";
import { WorkloadVpcStack } from "../lib/stacks/workload-vpc-stack";
import { PeeringConnectionStack } from "../lib/stacks/peering-connection-stack";

const app = new cdk.App();
// Change this naming convention to something unique for your app. I initially built this with the intention to make it a VPC for holding a VPN router.
const vpnStack = new VpnVpcStack(app, "cdk-public-vpc", {
  stackName: "vpn-ingress",
});

const workloadStack = new WorkloadVpcStack(app, "cdk-wl", {
  stackName: "workload",
});

new PeeringConnectionStack(app, "cdk-peering-connection", {
  ownerVpc: vpnStack.vpc,
  peeredVpc: workloadStack.vpc,
  stackName: "peering-connection",
});
