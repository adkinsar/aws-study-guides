import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { Construct } from "constructs";

interface VpcStackProps extends cdk.StackProps {
  vpcCidr: string;
}
const AZS: string[] = ["us-east-2a"];
const SUBNET_MASK: number = 28;

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
      availabilityZones: AZS,
      createInternetGateway: false,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "private-isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: SUBNET_MASK,
        },
      ],
    });

    const interfaceSg = new ec2.SecurityGroup(this, "interface-endpoint-sg", {
      vpc: vpc,
      securityGroupName: "vpc-endpoint-for-ssm-sg",
    });

    interfaceSg.addIngressRule(
      interfaceSg,
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from VPC"
    );

    // Create VPC endoints for AWS Systems Manager

    // Add S3 Gateway Endpoint
    vpc.addGatewayEndpoint("s3-gateway-endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    });
    vpc.addInterfaceEndpoint("ssm-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
      privateDnsEnabled: true,
    });
    vpc.addInterfaceEndpoint("ssm-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
      privateDnsEnabled: true,
    });
    vpc.addInterfaceEndpoint("ec2-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
      privateDnsEnabled: true,
    });
    vpc.addInterfaceEndpoint("ec2-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
      privateDnsEnabled: true,
    });

    const sg = new ec2.SecurityGroup(this, "instance-sg", {
      vpc,
      allowAllOutbound: true,
      securityGroupName: "ec2-instance-sg",
      description: "Allow inbound traffic from VPC endpoints",
    });
    sg.addIngressRule(
      sg,
      ec2.Port.tcpRange(32768, 60999), // cat /proc/sys/net/ipv4/ip_local_port_range
      "Allow all inbound HTTPS traffic from within VPC on ephemeral ports" // the ENI of the interface endpoint has IP in private subnet
    );
    sg.addIngressRule(
      sg,
      ec2.Port.HTTPS,
      "Allow all inbound HTTPS traffic from within VPC" // the ENI of the interface endpoint has IP in private subnet
    );

    // Create EC2 instance
    const instance = new ec2.Instance(this, "instance", {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      securityGroup: sg,
      role: new cdk.aws_iam.Role(this, "ec2-instance-role", {
        description:
          "Grant ec2 instances the ability to communicate with SSM and Bedrock",
        assumedBy: new cdk.aws_iam.ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore"
          ),
        ],
        inlinePolicies: {
          BedrockInvoke: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                actions: ["bedrock:Get*", "bedrock:Invoke*", "bedrock:List*"],
                resources: [
                  `arn:aws:bedrock:${this.region}::foundation-model/meta.llama3-3-70b-instruct-v1:0`,
                ],
                effect: cdk.aws_iam.Effect.ALLOW,
              }),
            ],
          }),
        },
        roleName: "bedrock-ec2-workload",
      }),
    });

    const inferenceProfile = new bedrock.CfnApplicationInferenceProfile(
      this,
      "inference-profile",
      {
        inferenceProfileName: "my-llama-profile",
        modelSource: {
          copyFrom:
            "arn:aws:bedrock:us-east-2::foundation-model/meta.llama3-3-70b-instruct-v1:0",
        },
      }
    );

    const invokeBedrockPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/meta.llama3-3-70b-instruct-v1:0`,
      ],
      principals: [new iam.ArnPrincipal(instance.role.roleArn)],
      effect: cdk.aws_iam.Effect.ALLOW,
    });
    const bedRockEndpoint = new ec2.InterfaceVpcEndpoint(
      this,
      "BedrockInterfaceEndpoint",
      {
        vpc: vpc,
        service: ec2.InterfaceVpcEndpointAwsService.BEDROCK_RUNTIME,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [sg],
        privateDnsEnabled: true,
      }
    );
    bedRockEndpoint.addToPolicy(invokeBedrockPolicy);
  }
}
