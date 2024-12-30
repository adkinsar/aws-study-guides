import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface VpcStackProps extends cdk.StackProps {
  ownerVpc: ec2.Vpc;
  peeredVpc: ec2.Vpc;
}
