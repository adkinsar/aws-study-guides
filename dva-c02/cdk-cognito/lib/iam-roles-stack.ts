import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface RoleProps extends cdk.StackProps {
  identityPoolId: string;
}
export class IamRolesStack extends cdk.Stack {
  readonly authenticatedRoleArn: string;
  readonly unauthenticatedRoleArn: string;
  constructor(scope: Construct, id: string, props: RoleProps) {
    super(scope, id);

    const authenticatedPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "mobileanalytics:PutEvents",
            "cognito-sync:*",
            "cognito-identity:*",
          ],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:List*"],
          resources: ["*"],
          conditions: {
            StringEquals: {
              "s3:prefix": "${aws:PrincipalTag/department}",
            },
          },
        }),
      ],
    });
    authenticatedPolicy.validateForAnyPolicy();

    const authenticatedFederatedIdentity = new iam.FederatedPrincipal(
      "cognito-identity.amazonaws.com",
      {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": props.identityPoolId,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      },
      "sts:AssumeRoleWithWebIdentity"
    );

    const authenticatedRole = new iam.Role(this, "CognitoAuthenticatedRole", {
      assumedBy: authenticatedFederatedIdentity,
      inlinePolicies: {
        authenticatedPolicy: authenticatedPolicy,
      },
      roleName: "a2-authenticated",
    });
    authenticatedRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sts:TagSession"],
        principals: [authenticatedFederatedIdentity],
      })
    );
    this.authenticatedRoleArn = authenticatedRole.roleArn;

    const unauthenticatedPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["cognito-identity:GetCredentialsForIdentity"],
          resources: ["*"],
        }),
      ],
    });
    unauthenticatedPolicy.validateForAnyPolicy();

    const unauthenticatedFederatedIdentity = new iam.FederatedPrincipal(
      "cognito-identity.amazonaws.com",
      {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": props.identityPoolId,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "unauthenticated",
        },
      },
      "sts:AssumeRoleWithWebIdentity"
    );

    const unauthenticatedRole = new iam.Role(
      this,
      "CognitoUnauthenticatedRole",
      {
        assumedBy: unauthenticatedFederatedIdentity,
        inlinePolicies: {
          authenticatedPolicy: unauthenticatedPolicy,
        },
        roleName: "a2-unauthenticated",
      }
    );
    this.unauthenticatedRoleArn = unauthenticatedRole.roleArn;
    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "identity-pool-attachment",
      {
        identityPoolId: props.identityPoolId,
        roles: {
          authenticated: this.authenticatedRoleArn,
          unauthenticated: this.unauthenticatedRoleArn,
        },
      }
    );
  }
}
