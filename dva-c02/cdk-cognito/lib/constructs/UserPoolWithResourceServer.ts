import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

export interface UserPoolProps {
  baseLogicalId: string;
  clientName: string;
  domainPrefix: string;
  groups?: string[];
  oAuthCallbackUrls: string[];
  resourceServer: {
    name: string;
    identifier: string;
    scopes?: {
      name: string;
      description: string;
    }[];
  };
  userPoolName: string;
}

export class UserPoolWithResourceServer extends Construct {
  readonly resourceServer: cognito.UserPoolResourceServer;
  readonly pool: cognito.UserPool;
  readonly poolClient: cognito.UserPoolClient;
  constructor(
    scope: Construct,
    id: string,
    private readonly props: UserPoolProps
  ) {
    super(scope, id);

    this.pool = new cognito.UserPool(this, `${this.props.baseLogicalId}`, {
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
      },
      customAttributes: {},
      deviceTracking: undefined,
      email: cognito.UserPoolEmail.withCognito(),
      lambdaTriggers: {},
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        otp: true, // free
        sms: false, // Uses SNS
        email: false, // Uses SES
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: false,
        preferredUsername: false,
        username: false,
      },
      signInCaseSensitive: true,
      userPoolName: `${this.props.userPoolName}`,
    });

    const serverOptions =
      UserPoolWithResourceServer.createResourceServerOptions(
        this.props.resourceServer.identifier,
        this.props.resourceServer.name,
        this.props.resourceServer.scopes
      );

    const resourceServer = this.pool.addResourceServer(
      `${this.props.baseLogicalId}-api`,
      serverOptions
    );

    this.poolClient = this.pool.addClient(
      `${this.props.baseLogicalId}-client`,
      {
        userPoolClientName: `${this.props.clientName}`,
        generateSecret: false,
        authFlows: {
          userSrp: true,
          custom: true,
        },
        oAuth: {
          callbackUrls: this.props.oAuthCallbackUrls,
          scopes: this.createOAuthScopes(
            this.props.resourceServer?.identifier,
            this.props.resourceServer?.scopes
          ),
          flows: {
            implicitCodeGrant: true,
            authorizationCodeGrant: true,
          },
        },
        refreshTokenValidity: Duration.days(5),
        preventUserExistenceErrors: true,
      }
    );

    this.poolClient.node.addDependency(resourceServer);

    new cognito.UserPoolDomain(this, `${this.props.baseLogicalId}-domain`, {
      userPool: this.pool,
      cognitoDomain: {
        domainPrefix: this.props.domainPrefix,
      },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });
    // maybe bring to a function
    this.props.groups &&
      this.props.groups.map((group) => {
        group.toLowerCase();
        this.pool.addGroup(`group-${group}`, {
          groupName: `${group}`,
        });
      });

    this.pool.addTrigger(
      cognito.UserPoolOperation.PRE_TOKEN_GENERATION_CONFIG,
      lambda.Function.fromFunctionName(
        this,
        "pre-token-trigger",
        "cognito-lambdas-PreToken" // this needs to be a parameter
      ),
      cognito.LambdaVersion.V2_0
    );
  }

  static createResourceServerOptions = (
    identifier: string,
    name: string,
    scopes?: {
      name: string;
      description: string;
    }[]
  ): cognito.UserPoolResourceServerOptions => {
    const options = {
      identifier: identifier,
      userPoolResourceServerName: name,
    };
    const serverScopes =
      scopes &&
      scopes.map((scope) => {
        return new cognito.ResourceServerScope({
          scopeName: scope.name,
          scopeDescription: scope.description,
        });
      });
    const optionsWithScopes = { ...options, scopes: serverScopes };

    return serverScopes ? optionsWithScopes : options;
  };
  createOAuthScopes = (
    identifier?: string,
    scopes?: {
      name: string;
      description: string;
    }[]
  ): cognito.OAuthScope[] => {
    const defaultScopes = [
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.PROFILE,
    ];
    const customScopes =
      scopes &&
      identifier &&
      scopes.map((scope) => {
        const id = cognito.UserPoolResourceServer.fromUserPoolResourceServerId(
          this,
          "rs",
          identifier
        ).userPoolResourceServerId;
        return cognito.OAuthScope.custom(`${id}/${scope.name}`);
      });
    return customScopes ? [...defaultScopes, ...customScopes] : defaultScopes;
  };
}
