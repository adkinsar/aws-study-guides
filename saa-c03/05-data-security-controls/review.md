## Determining Appropriate Data Security Controls Key Topics

All storage at AWS is multi-tenant by design. All storage is private at its onset, accessible across the AWS private network. S3 can be made public if configured that way, but all all other services are private and not publicly accessible across the Internet. 


### Infrastructure security 


**DDoS Protection**: Use Amazon Web Application Firewall and Shield to protect from DDoS attacks.

**Network isolation**: Utilize the private AWS network where possible to access services. This can be accomplished from a VPC through private endpoints.

Application-layer threat protection: AWS Web Application Firewall can be used to create rules and filters that accept or reject requests to CloudFront, API Gateway, or Application Load Balancers.

Security Groups: Use SG to SG traffic patterns where possible

Network ACL: Design for workloads using zone based modeling, allowing only intended traffic to reach each subnet.

### Amazon Detective

Graphically analyzes AWS CloudTrail management events, VPC Flow Logs, AWS GuardDuty finding, and Amazon EKS audit logs to help identify the cause of potential security issues. 

### Amazon EBS Encryption


Encrypting EBS volumes ensure that data cannot be read or access by unauthorized parties, even if the underlying volume is compromised. KMS provides the customer master key and data key for this operation. Volumes can be encrypted at creation or after they have been created. You can also encrypt snapshots for encrypted backups. This feature's availability by the EC2 instance support for it. When an encrypted EBS volume is attached to an EC2 instance it automatically downloads and installs the necessary cryptographic components. This includes the AWS Encryption SDK and the public key portion of the Customer Master Key (CMK). *I think the book is wrong here, it might be the data key signed by the CMK* since symmetric keys are used here. The data key is stored encrypted with the EBS volume's metadata. When access to the encrypted disk is needed, EC2 sends a request to decrypt to KMS. EBS sends a request to KMS to decrypt the data key and KMS uses the CMK to decrypt the data key which is sent to EC2 and stored in protected memory. 

### S3 Storage at Rest


**SSE-S3**: Amazon S3 manages the encryption and decryption of data in the bucket. Customers can access the data transparently without having to manage keys.

**SSE-KMS**: Using KMS to manage encryption keys. User SSE-KMS to use bucket keys to reduce the cost of calls to KMS. You would opt for this because KMS keys can be audited.

**SSE-C**: This is a customer-provided encryption keys. This key is not stored with the object, it must be supplied for every encrypt/decrypt operation. 

### S3 Object Lock Policies

Objects can be locked using a write-once/read-many (WORM) policy.  Object lock policies enable you to set rules that restrict certain actions on objects, such as deleting or overwriting them, in order to protect objects and ensure they remain available and unaltered. Object lock policies are set at the S3 bucket level and apply to all objects in the bucket, or set on individual objects. This can be useful for complying with legal or regulatory requirements or protecting important or sensitive data. 

### Amazon S3 Glacier Storage at Rest

Objects stored in Amazon S3 Glacier are automatically encrypted using SSE and AES-256 encryption. Amazon S3 Glacier Vault Lock enables you to deploy and enforce regulatory and required compliance controls by applying a Vault Lock policy on an Amazon S3 Glacier vault. Once a WORM policy has been applied to an S3 Glacier vault, the policy cannot be changed.