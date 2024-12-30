import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class WorkloadVpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  private readonly sg: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcProps: ec2.VpcProps = {
      availabilityZones: ["us-east-2b"],
      //cidr: "",
      createInternetGateway: false,
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      flowLogs: {},
      gatewayEndpoints: {},
      ipAddresses: ec2.IpAddresses.cidr("192.168.0.0/24"),
      //maxAzs: 1,
      natGateways: 0,
      // natGatewayProvider: ec2.NatProvider.gateway(),
      // natGatewaySubnets: {
      //   subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      // },
      restrictDefaultSecurityGroup: true,
      subnetConfiguration: this.getSubnetConfiguration(),
      vpcName: "workload-private",
      //vpnConnections: {},
      vpnGateway: false,
      //vpnGatewayAsn: 65000,
      //vpnRoutePropagation: [],
    };
    this.vpc = new ec2.Vpc(this, "dev-wl-vpc", vpcProps);
    this.sg = this.createSecurityGroup(this.vpc);
    const kp = this.createSshKeyPair();
    const instance = this.createEc2Instance(this.vpc, this.sg, kp);
  }

  createSecurityGroup(vpc: ec2.Vpc): ec2.SecurityGroup {
    const icmpSg = new ec2.SecurityGroup(this, "icmp-sg", {
      vpc: vpc,
      description: "Allow inbound icmp from peered vpc",
      allowAllOutbound: false,
      securityGroupName: "peered-icmp-ssh",
    });
    icmpSg.addIngressRule(
      ec2.Peer.ipv4("10.0.0.0/24"), // how can we reference this programmatically?
      ec2.Port.allIcmp(),
      "Allow ICMP from VPC peer"
    );
    icmpSg.addIngressRule(
      ec2.Peer.ipv4("10.0.0.0/24"),
      ec2.Port.SSH,
      "Allow SSH from VPC peer"
    );
    icmpSg.addEgressRule(
      ec2.Peer.ipv4("10.0.0.0/24"), // how can we reference this programmatically?
      ec2.Port.allIcmp(),
      "Allow outbound traffic on ephemeral ports"
    );
    return icmpSg;
  }
  createSshKeyPair(): ec2.KeyPair {
    const kp = ec2.KeyPair.fromKeyPairName(
      this,
      "public-ssh",
      "network-lab"
    ) as ec2.KeyPair;
    return kp;
  }
  getSubnetConfiguration(): ec2.SubnetConfiguration[] {
    return [
      {
        cidrMask: 28,
        name: "private-isolated",
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      {
        cidrMask: 28,
        name: "private-egress",
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    ];
  }
  createEc2Instance(
    vpc: ec2.Vpc,
    sg: ec2.SecurityGroup,
    kp: ec2.KeyPair
  ): ec2.Instance {
    return new ec2.Instance(this, "dev-instance", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      keyPair: kp,
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: sg,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      associatePublicIpAddress: false,
      userDataCausesReplacement: false,
    });
  }
}
