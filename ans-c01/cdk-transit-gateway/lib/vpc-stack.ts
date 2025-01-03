import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface VpcStackProps extends cdk.StackProps {
  transitGatewayId: string;
  vpcCidr: string;
  peerVpcCidr: string;
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

    const interfaceSg = new ec2.SecurityGroup(this, "security-group", {
      vpc: vpc,
      securityGroupName: "vpc-endpoint-for-ssm-sg",
    });

    interfaceSg.addIngressRule(
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
      securityGroups: [interfaceSg],
    });
    vpc.addInterfaceEndpoint("ssm-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
    });
    vpc.addInterfaceEndpoint("ec2-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
    });
    vpc.addInterfaceEndpoint("ec2-messages-interface-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [interfaceSg],
    });

    // Create TGW attachment
    const tgwAttachment = new ec2.CfnTransitGatewayAttachment(
      this,
      "tgw-vpc-attachment",
      {
        transitGatewayId: props.transitGatewayId,
        vpcId: vpc.vpcId,
        subnetIds: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }).subnetIds,
      }
    );

    // Add route to peer VPC via Transit Gateway
    vpc.isolatedSubnets.forEach((subnet, i) => {
      new ec2.CfnRoute(this, `tgw-route-${i}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: props.peerVpcCidr,
        transitGatewayId: props.transitGatewayId,
      }).addDependency(tgwAttachment);
    });

    // Security group for instances
    const sg = new ec2.SecurityGroup(this, "instance-sg", {
      vpc,
      allowAllOutbound: true,
    });

    // Allow inbound from peer VPC
    sg.addIngressRule(
      ec2.Peer.ipv4(props.peerVpcCidr),
      ec2.Port.allIcmp(),
      "Allow all ICMP from peer VPC"
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
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: sg,
      role: new cdk.aws_iam.Role(this, "ssm-role", {
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
