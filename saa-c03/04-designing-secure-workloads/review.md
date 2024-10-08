## Designing Secure Workloads and  Applications Key Topics

### AWS Shield

Standard - For all customers Shield Standard is deployed at edge locations protecting against known layer 3 and 4 DDoS attacks using AWS Web Application Firewall rules manged by AWS.

Advanced - A paid offering that is managed by AWS. Customers are given a dedicated DDoS response team with a 15 minute SLA and a global threat dashboard for monitoring. It also provides cost protection against any compute resources created as a result of scaling due to DDoS attacks. The service includes AWS WAF and AWS Firewall Manager for free and costs $3000 a month. 

### AWS Web Application Firewall (WAF)

Provides the ability to create custom filtering for incoming IPv6 and IPv4 requests to edge locations. It can filter traffic that hits CloudFront, public facing load balancers, API Gateway, and AppSync. Rules define conditions that meet custom security requirements. Rules can be based on source IP address, cookie values, header values, HTTP methods, and query strings. You can apply regular rules, rate-based rules, or group rules (a combination of first two).

### The Main Route Table

Every VPC comes with a default route table. It defines all routing for all subnets that are not explicitly mapped to any other custom table and cannot be deleted by the customer. The local route entry in a route table cannot be removed. It initially points to the VPC's initial CIDR designations. Updates to the local route can be done by pointing it to a NAT Gateway, network interface, or a Gateway Load Balancer endpoint.

### Custom Route Tables

Created by the customer for custom network architectures that require routing traffic to specific destinations. 

### Route Table Cheat Sheet

- Each VPC has a main route table that provides local routing. Each new subnet is implicitly associated with this table on creation through the dashboard.
- Never add additional routes to the main route table. In the event a new subnet is added without a custom table you do not want it to erroneously pick up routes that are not intended for it. 
- Subnet destinations are matched with the most definitive route within the route table that matches the traffic request. 

### Security Groups

A security group is a virtual software firewall that controls incoming and outgoing network traffic for one or more EC2 instances within a VPC. Every security group is associated with a VPC and has a set of inbound and outbound rules that designate the ports and protocols allowed in and out of each network interface. The initial quota for security groups an EC2 instance can be associated with is 5, and each security group can have up to 50 inbound and outbound IPv4 or IPv6 rules. Security groups are used to *allow* traffic flow, the default group only allows outbound traffic. They are also *stateful*, meaning traffic in out direction automatically allows traffic in the opposite direction. You can define outbound traffic from one security group into another security group. Changes to a security group take effect immediately. It is important to note the *ephemeral port* range for the OS of your machine that sending outbound traffic. This needs to be allowed in both security groups and NACLs to allow dynamic communication over these port ranges. On Linux it is 32768-61000.

### Network Access Control List (NACL)

An optional firewall that controls inbound and outbound access at the subnet level of a VPC. It is a set of rules that allows or denies traffic based upon source and destination IP addresses, ports, and protocols. Both TCP and UDP are supported, NACLs are meant to supplement security groups through an additional layer of security. Rules are placed in an ascending numerical order and are evaluated in order; best practice is to use increments of 10. The first match is evaluated so the logical order matters. Rules are considered *stateless* which means that inbound and outbound rules are evaluated without regards to one another. The default NACL allows all inbound and outbound traffic and can be modified. 

### VPC Flow Logs

VPC flow logs are used for analyzing and monitoring traffic going to and from a VPC. They can be enabled for different VPC resources including the VPC, subnet, or elastic network interface. They record information about IP traffic flowing in and out of a VPC including source and destination addresses, ports, protocols, and packet and byte counts. It does not cost for creating a flow log but the associate storage costs money. They can be stored as CloudWatch logs or directly in an S3 bucket. Not all traffic within a VPC is logged. For instance Route 53 traffic, EC2 instance metadata requests, Amazon Time Sync Service, DHCP, and reserved IP address traffic is not logged. It is worth noting that it is possible to capture traffic flowing to and from Route 53 but must be setup by the customer.


### NAT Services 

- **Amazon Virtual Private Cloud (VPC) NAT Gateway:** Enables instances in a private subnet to access the Internet without exposing private IPs. This will be hosted in a public subnet with a static public IP address. Route table entries are required for each private subnet's route table providing a path to the NAT Gateway. Security groups and port forwarding are not supported by this service.
- **AWS Transit Gateway NAT:** Enables instances in a VPC or on-premises network to access the Internet without exposing their private IPs.
- **AWS PrivateLink NAT Gateway:** Enables instances in a VPC to access resources in another VPC or on-premises network without exposing their private IPs.

### Amazon Cognito

Service providing authentication, authorization, and user management. You can utilize third-party identity providers to federate users. You can also establish your own user pools. User pools provide sign up and sign in features for users as well as security features like MFA and password policies. Pool members can login using a username, phone number, or email address; authenticator applications or SMS are supported MFA types. 

### External Connections

To connect to a VPC directly from outside of AWS you need a virtual private gateway attached to the VPC. The gateway uses IPSec to encrypt data transmitted from on-premises to the VPC. The customer must also have its own gateway at the on-prem network side as well to facilitate the VPN tunnel between both gateways. 

### AWS Direct Connect

Dedicated Connections provide a single-tenant network connection between on-premises and a VPC. These have capacity from 1-100 Gbps. A hosted connection allows you to establish a connection to AWS Direct Connect over the public Internet. It has a capacity of 50, 100, or 200 Mbps.

A virtual public interface enables access to Amazon cloud services; a private virtual interface enables access to a VPC. You are charged based upon the data transfer and port hours used. Am AWS Direct Connect gateway allows you to connect to multiple VPCs and can be associated with a Transit Gateway. The connection can also be used with an IPSec VPN connection for added security.

### Amazon GuardDuty

A managed threat detection service that continuously monitors EC2, containers, Aurora DBs, and S3 buckets using anomaly detection powered by machine learning to identify malicious activity such as unauthorized access or unusual behavior. It performs real-time analysis and actions can be automated using Lambda or EventBridge. It is an IDS managed my Amazon. It can be deployed with AWS Organizations. When it finds malware issues with EBS volumes, it creates replica snapshots. It also integrates with Security Hub and Detective to perform automated remediations.

### Amazon Macie

A security service that utilizes machine learning to locate PII or sensitive data stored in S3 buckets. It prevents unauthorized access and accidental data leaks. It can analyze encrypted objects with the exception of objects encrypted with customer-provided keys. 

### AWS CloudTrail

Records all AWS API calls carried out in an account related to actions across infrastructure. All authentication events from the SDK, CLI, and management account are logged by default and stored free of charge for 90 days. Useful for event history related to resource management, compliance, and operational and risk auditing. Custom trails can be stored longer than the default 90 days in S3 or CloudWatch. 

### AWS Secrets Manager

It does exactly what is sounds like. You can use a private interface endpoint for EC2 instances to connect directly across the AWS private network. Credential rotation for databases can be configured through the service.

### Amazon Inspector

Tests the security levels of EC2 instances and ECR images using rules packages defined by industry standards such as CVE checks, CIS checks, OS benchmarks, and other security best practices. 

### AWS Config

AWS Config enables customers to monitor, audit, and evaluate the deployed configurations of deployed IaaS resources, including EC2 instances, VPCs and components, IAM permissions, and S3 buckets deployed in a single AWS account or AWS accounts managed by an AWS organization. AWS Config provides detailed records of resource inventory, configuration history, and changes. Configuration data collected by AWS Config is stored in Amazon S3 buckets and Amazon DynamoDB.