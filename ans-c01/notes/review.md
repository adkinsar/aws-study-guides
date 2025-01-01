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
