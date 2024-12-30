import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpnVpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  private readonly sg: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcProps: ec2.VpcProps = {
      availabilityZones: ["us-east-2b"],
      //cidr: "",
      createInternetGateway: true,
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      flowLogs: {},
      gatewayEndpoints: {},
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/24"),
      //maxAzs: 1,
      natGateways: 0,
      // natGatewayProvider: ec2.NatProvider.gateway(),
      // natGatewaySubnets: {
      //   subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      // },
      restrictDefaultSecurityGroup: true,
      subnetConfiguration: this.getSubnetConfiguration(),
      vpcName: "pfsense-ingress",
      //vpnConnections: {},
      vpnGateway: false,
      //vpnGatewayAsn: 65000,
      //vpnRoutePropagation: [],
    };

    this.vpc = new ec2.Vpc(this, "dev-vpc", vpcProps);
    this.sg = this.createSecurityGroup(this.vpc);
    const kp = this.createSshKeyPair();

    const instance = this.createEc2Instance(this.vpc, this.sg, kp);
  }

  getSubnetConfiguration(): ec2.SubnetConfiguration[] {
    return [
      {
        cidrMask: 28,
        name: "public",
        subnetType: ec2.SubnetType.PUBLIC,
      },
    ];
  }

  createSshKeyPair(): ec2.KeyPair {
    const kp = ec2.KeyPair.fromKeyPairName(
      this,
      "public-ssh",
      "network-lab"
    ) as ec2.KeyPair;
    return kp;
  }

  createSecurityGroup(vpc: ec2.Vpc): ec2.SecurityGroup {
    const sshSg = new ec2.SecurityGroup(this, "http-sg", {
      vpc: vpc,
      description: "Allow SSH traffic from anywhere",
      allowAllOutbound: false,
      securityGroupName: "public-ssh",
    });
    sshSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.SSH,
      "Allow SSH access from anywhere"
    );
    sshSg.addIngressRule(
      ec2.Peer.ipv4("192.168.0.0/24"),
      ec2.Port.icmpPing(),
      "Allow ICMP ping traffic from peer VPC"
    );
    sshSg.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTcp(),
      //ec2.Port.tcpRange(32768, 65535), // potential bug?
      "Allow outbound traffic on ephemeral ports"
    ); // this could be a security vulnerability, unless we need to download from the internet?
    return sshSg;
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
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyPair: kp,
      securityGroup: sg,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      associatePublicIpAddress: true,
      userDataCausesReplacement: false,
    });
  }
}
