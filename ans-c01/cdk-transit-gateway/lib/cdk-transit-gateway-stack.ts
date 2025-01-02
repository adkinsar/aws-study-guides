import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

const AZS: string[] = ["us-east-2a", "us-east-2b"];
const VPC_CIDR: string = "10.0.0.0/24";
const SUBNET_MASK: number = 28;

export class CdkTransitGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a vpc with two isolated subnets remove the default security group rules
    const vpc = new ec2.Vpc(this, "tgw-vpc", {
      ipAddresses: ec2.IpAddresses.cidr(VPC_CIDR),
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
    // create a transit gateway that will connect to the vpc
    const transitGateway = new ec2.CfnTransitGateway(this, "lab-tgw");

    // create an attachment for the vpc
    const vpcAttachment = new ec2.CfnTransitGatewayAttachment(
      this,
      "tgw-vpc-attachment",
      {
        transitGatewayId: transitGateway.ref,
        vpcId: vpc.vpcId,
        subnetIds: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }).subnetIds,
      }
    );

    // create a security group that has an ingress rule for https traffic on port 443 originating from 10.0.0.0/24
    const sg = new ec2.SecurityGroup(this, "security-group", {
      vpc: vpc,
      securityGroupName: "vpc-endpoint-for-ssm-sg",
    });

    sg.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
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
      securityGroups: [sg],
    });
    vpc.addInterfaceEndpoint("ssm-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [sg],
    });
    vpc.addInterfaceEndpoint("ec2-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [sg],
    });
    vpc.addInterfaceEndpoint("ec2-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [sg],
    });
    const server = new ec2.Instance(this, "dev-instance", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      associatePublicIpAddress: false,
      userDataCausesReplacement: false,
      role: new cdk.aws_iam.Role(this, "ssm-instance-role", {
        assumedBy: new cdk.aws_iam.ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore"
          ),
        ],
      }),
    });
  }
}
