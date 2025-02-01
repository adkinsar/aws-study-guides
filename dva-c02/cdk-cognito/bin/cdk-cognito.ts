#!/usr/bin/env bun
import * as cdk from "aws-cdk-lib";
import { UserPoolStack } from "../lib/user-pool-stack";
import { IdentityPoolStack } from "../lib/identity-pool-stack";
import { IamRolesStack } from "../lib/iam-roles-stack";

const app = new cdk.App();

const userPoolStack = new UserPoolStack(app, "UserPoolStack", {
  stackName: "A2Cognito",
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: process.env["CDK_DEFAULT_REGION"],
  },
});

const identityPoolStack = new IdentityPoolStack(app, "IdentityPoolStack", {
  stackName: "A2IdentityPool",
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: process.env["CDK_DEFAULT_REGION"],
  },
  clientId: userPoolStack.userPool.poolClient.userPoolClientId,
  providerName: userPoolStack.userPool.pool.userPoolProviderName,
  poolName: "a2-identity-pool",
  principalTags: {
    department: "department",
  },
});

const iamRoleStack = new IamRolesStack(app, "IamRolesStack", {
  stackName: "A2IamRoles",
  identityPoolId: cdk.Fn.importValue("IdentityPoolId"),
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: process.env["CDK_DEFAULT_REGION"],
  },
});
iamRoleStack.addDependency(identityPoolStack);
