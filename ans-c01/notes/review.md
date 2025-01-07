## Network Design

### Key Terms

#### Customer Gateway

A resource in AWS that represents the physical/software device residing in the customer on-prem network. It is the side of the VPN connection managed by the customer. The Internet-routable IP of the Customer Gateway must be static. The IP may also reside behind a device performing network address translation (NAT).

#### static routing

A type of routing to configure Site-to-Site VPN if your Customer Gateway does not support Border Gateway Protocol

#### dynamic routing

A type of routing that be used in Site-to-Site VPN is the Customer Gateway device supports Border Gateway Protocol

#### Autonomous System Number

A unique identifier assigned to a network or group of networks that are managed by a single organization and have a unified routing policy. They are distributed by regional Internet Registries and blocks are assigned by the IANA. If you wish to establish a Site-to-Site VPN AWS reserves the number **7224** in all regions. The default ASN in an AWS VPN connection is **65000**. If you do not have a public ASN you can use a private ASN in the range of 64,512 to 65,534.

#### Virtual Private Gateway

The VPN concentrator on the Amazon side of the site-to-site VPN connection.

#### Unsupported VPN features

- IPv6 traffic is not supported for VPN connections with a Virtual Private Gateway.
- Path MTU Discover is not supported with an AWS VPN connection

## Network Implementation

### AWS Global Accelerator

Reduce latency for users by routing traffic to the nearest application endpoint that is in closest proximity to users.

### Transit Gateway attachment types

#### Peering

#### VPC

#### VPN

#### Transit Gateway Connect

An attachment type that uses Generic Routing Encapsulation (GRE) for higher bandwith performance compared to a VPN connection. GRE tunnels can also be used for establishing a connection to a third-party SD-WAN virtual appliance.

### Transit Gateway Network Manager

Provides a global view of your private network, allowing you to manage you AWS and on-premises resources and itegrate with your SD-WAN

### AWS Load Balancer Controller

An optional add-on in EKS that manages elastic load balancers for a Kubernetes cluster. Kubernetes ingress utilizes Application Load Balancers. A Kubernetes load-balancer service will produce a Network Load Balancer.

### AWS Services through AWS PrivateLink

Be sure to enable private DNS names for your VPC endpoints for AWS services. This ensures that requests that use the public service endpoints, such as requests made through an AWS SDK, resolve to your VPC endpoint. Best practice is to access the AWS service by using its Regional DNS name, also known as the public endpoint.

Amazon provides a DNS server for your VPC, called the Route 53 Resolver. The Route 53 Resolver automatically resolves local VPC domain names and record in private hosted zones. However, you can't use the Route 53 Resolver from outside your VPC. If you'd like to access your VPC endpoint from your on-premises network, you can use Route 53 Resolver endpoints and Resolver rules.

VPCs with enpoints in multiple AZs to the same service use a round robin algorithm to pass traffic to a healthy network interface. Traffic gets resolved to the IP address of the selected network interface. If you want to map traffic to the endpoint in a given resource's AZ then use the private zonal endpoint or the IP address of the endpoint network interface.

If an interface VPC endpoint supports IPv4, the endpoint network interfaces have IPv4 addresses. If an interface VPC endpoint supports IPv6, the endpoint network interfaces have IPv6 addresses.
The IPv6 address for an endpoint network interface is unreachable from the internet. If you describe an endpoint network interface with an IPv6 address, notice that denyAllIgwTraffic is enabled.
