## Well Architected Framework Key Topics

### Operational Excellence Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/operational-excellence.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)

An iterative approach to optimizing a workload's operational models, procedures, principles, patterns, and practices. This process is ongoing because the platform of AWS is constantly evolving. Once a workload is operating with the right amount of security, reliability, performance, and resource usage the cost is exactly right. This pillar is most effective when driven by a Cloud Center of Excellence in an organization.

### Security Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html?ref=wellarchitected-wp)

Security is emphasized in the design of solution architectures to ensure a workload's survival from attacks and disaster scenarios.

#### Governing Design Principles

- Implement a strong, centralized **identity foundation** using the principle of least privilege. Eliminate the usage of long-term static credentials.
- Monitoring, alerting, and auditing of environment changes, logs, and metrics create **traceability**
- Apply security at all layers (defense in depth)
- Automate security best practices
- Protect data in transit and at rest
- Keep people away from data with proper access controls
- Prepare for security events with incident response simulations and having proper incident management policies in place.

### Reliability Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html?ref=wellarchitected-wp)

A workload should be available and capable of performing its business requirement(s) without failure. This includes an organization's ability to operate and test the workload throughout its full lifecycle.

#### Governing Design Principles

- Automatically recover from workload failures. This necessitates having key performance indicators (KPIs) related to the health and function of a workload. These KPIs measure business value (same methodology as chaos engineering) not technical values (e.g. CPU or RAM utilization). Monitoring and being able to predict via these KPIs create possibility for self-healing workloads.
- Test recovery procedures via fault injection and chaos experiments to simulate different failure scenarios.
- Scale horizontally to reduce single points of failure in an architecture
- Auto-scale capacity, don't guess what it should be
- Manage change via version-controlled change management practices.

### Performance Efficiency Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/performance-efficiency.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html?ref=wellarchitected-wp)

Maximizing your performance efficiency requires knowing your workload requirements as they change over time. This requires a significant data set to analyze in order to make informed decisions about the resources to deploy. Parallelism, scalability, and the underlying network speed all impact performance efficiency.

#### Governing Design Principles

- Outsource specialized technology to managed services where possible as a strategic decision.
- Utilize multi-region deployments to get closer to customers.
- Serverless architectures where applicable
- Experiment often
- Consider mechanical sympathy, or select the right tool for the job

### Cost Optimization Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-optimization.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html?ref=wellarchitected-wp)

Reduce costs for maximum return on investment of business applications.

#### Governing Design Principles

- Implement Cloud Financial Management
- Adopt a consumption model where you only pay for the resources you use. Turn things off when they are not needed.
- Measure the efficiency of workloads by their output and the cost associated with deliverying them.
- Undifferentiated heavy lifting is not our friend.
- Analyze and attribute expenditure accurately

### Sustainability Pillar

[Reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/sustainability.html) | [Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html?ref=wellarchitected-wp)

Reduce energy consumption and maximize efficieny of utilized resources.

#### Governing Design Principles

- Understand your impact from workloads
- Establish sustainability goals
- Maximize utilization of resources
- Adopt the most efficient hardware and software offerings
- Use managed services where possible
- Reduce impact on client devices
