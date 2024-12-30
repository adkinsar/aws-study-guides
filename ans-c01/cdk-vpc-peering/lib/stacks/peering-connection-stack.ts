// create an empty cdk stack
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcStackProps } from "../types/vpc-types";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class PeeringConnectionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const vpcPeeringConnection = new ec2.CfnVPCPeeringConnection(
      this,
      "peer-connection",
      {
        peerVpcId: props.peeredVpc.vpcId,
        vpcId: props.ownerVpc.vpcId,
      }
    );

    props.ownerVpc.publicSubnets.forEach((subnet) => {
      new ec2.CfnRoute(this, `${subnet.node.id}-route`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: props.peeredVpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      });
    });

    props.peeredVpc.isolatedSubnets.forEach((subnet) => {
      new ec2.CfnRoute(this, `${subnet.node.id}-route`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: props.ownerVpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      });
    });
  }
}
