# PRODUCTION DEPLOYMENT GUIDE
## dnPeople — AWS + Kubernetes + Helm Deployment

**Version:** 1.1 Deployment Runbook  
**Date:** 3 July 2026 · **Updated:** 7 July 2026  
**Target Environment:** AWS Production (ap-southeast-1)  
**Status:** ✅ Templates ready (`terraform/`, `k8s/helm/`, `docker-compose.prod.yml`, deploy workflows) · 🟡 Live apply pending credentials  
**Quick start:** `npm run checklist:prod` → `terraform apply -var-file=prod.tfvars` → Deploy Production workflow

---

## 📋 TABLE OF CONTENTS

1. Pre-Deployment Checklist
2. AWS Infrastructure Setup (Terraform)
3. Database Setup & Migration
4. Kubernetes Cluster Setup
5. Helm Chart Deployment
6. SSL/TLS & DNS Configuration
7. Monitoring & Logging Setup
8. Backup & Disaster Recovery
9. Security Hardening
10. Production Testing & Validation
11. Rollback Procedure
12. Post-Deployment Operations

---

## 1. PRE-DEPLOYMENT CHECKLIST

### 1.1 Infrastructure Readiness

```
AWS ACCOUNT:
☐ AWS account created (production)
☐ Billing enabled
☐ Budget alerts configured
☐ Root account secured (MFA enabled)
☐ IAM users created for team

NETWORKING:
☐ VPC created
☐ Subnets (public + private) in 2+ AZs
☐ Internet Gateway attached
☐ NAT Gateway configured
☐ Route tables configured

SECURITY:
☐ Security groups created (ALB, API, RDS)
☐ VPC Endpoints configured (S3, DynamoDB)
☐ VPC Flow Logs enabled
☐ AWS Secrets Manager configured
☐ ACM certificates issued (domain TLS)
```

### 1.2 Application Readiness

```
CODE:
☐ All code merged to main branch
☐ Docker images built & pushed to ECR
☐ Helm charts reviewed & validated
☐ Environment variables documented

DATABASE:
☐ TypeORM migrations generated
☐ Migrations tested locally & staging
☐ Schema backup procedure documented
☐ Backup retention policy set (30 days)

SECRETS:
☐ All secrets in AWS Secrets Manager
☐ Database password rotated
☐ JWT secret generated (strong, random)
☐ Stripe API key (production) obtained
☐ SendGrid key obtained

TESTING:
☐ Smoke tests passing (Cypress)
☐ Load testing completed (baseline established)
☐ Security audit completed (OWASP)
☐ Staging deployment successful
```

---

## 2. AWS INFRASTRUCTURE SETUP (TERRAFORM)

### 2.1 Terraform Directory Structure

```
terraform/
├── main.tf                    # Main config
├── vpc.tf                     # VPC, subnets, security groups
├── rds.tf                     # PostgreSQL database
├── elasticache.tf             # Redis cluster
├── eks.tf                     # EKS cluster
├── s3.tf                      # S3 for backups, exports
├── iam.tf                     # IAM roles & policies
├── variables.tf               # Variable definitions
├── terraform.tfvars           # Development values
├── prod.tfvars                # Production values
├── outputs.tf                 # Output values
└── .gitignore                 # Exclude .tfstate files
```

### 2.2 Terraform Initialization & Planning

```bash
# 1. Initialize Terraform
cd terraform
terraform init

# 2. Select workspace
terraform workspace list
terraform workspace select prod  # or create new

# 3. Plan infrastructure changes
terraform plan -var-file=prod.tfvars -out=tfplan

# 4. Review plan
# Look for:
# - Database: Multi-AZ, automated backups enabled
# - Redis: Multi-AZ, automatic failover
# - EKS: 2+ nodes, autoscaling enabled
# - Load Balancer: Health checks configured
# - Security groups: Restrictive ingress rules

# 5. Apply configuration
terraform apply tfplan

# 6. Capture outputs
terraform output > /tmp/aws-outputs.json
# Save this file! Contains:
# - EKS cluster endpoint
# - RDS endpoint
# - Redis endpoint
# - S3 bucket names
```

### 2.3 Key Terraform Variables

```hcl
# prod.tfvars

# Network
aws_region              = "ap-southeast-1"  # Singapore (closest to Indonesia)
vpc_cidr                = "10.0.0.0/16"
availability_zones      = ["ap-southeast-1a", "ap-southeast-1b"]

# RDS Database
db_instance_class       = "db.r6i.xlarge"  # Production-grade
db_allocated_storage    = 100               # GB
db_max_allocated_storage = 500              # Auto-scaling max
db_backup_retention_days = 30
db_multi_az             = true              # High availability
db_deletion_protection  = true              # Prevent accidental deletion

# Redis
elasticache_node_type   = "cache.r6g.xlarge"
elasticache_num_cache_nodes = 3             # High availability
elasticache_automatic_failover = true

# EKS Cluster
eks_cluster_version     = "1.28"            # Latest stable
eks_desired_size        = 3                 # Min 3 nodes
eks_max_size            = 10                # Auto-scaling max
eks_instance_type       = "t3.2xlarge"
eks_volume_size         = 100               # GB

# Networking
enable_nat_gateway      = true
enable_vpn_gateway      = false             # Set to true if needed
single_nat_gateway      = false             # false for HA (multi-AZ)

# Tags
environment             = "production"
project                 = "dntech-erp"
cost_center             = "engineering"
```

### 2.4 Terraform Outputs Example

```hcl
# outputs.tf

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS cluster endpoint for kubectl"
}

output "eks_cluster_ca_data" {
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
  description = "EKS cluster CA certificate"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS PostgreSQL endpoint"
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis primary endpoint"
}

output "s3_bucket_exports" {
  value       = aws_s3_bucket.exports.id
  description = "S3 bucket for exports & backups"
}
```

---

## 3. DATABASE SETUP & MIGRATION

### 3.1 RDS Configuration

```bash
# 1. Get RDS endpoint from Terraform output
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
echo $RDS_ENDPOINT  # e.g., erp-prod-db.c9akciq32.ap-southeast-1.rds.amazonaws.com

# 2. Test connection from local
psql -h $RDS_ENDPOINT -U erp_user -d erp_prod

# 3. Create database (if not exists)
# Usually done by Terraform, but verify:
psql -h $RDS_ENDPOINT -U postgres -c "CREATE DATABASE erp_prod;"

# 4. Verify backups enabled
aws rds describe-db-instances \
  --db-instance-identifier erp-prod-db \
  --query 'DBInstances[0].BackupRetentionPeriod'
# Should return: 30
```

### 3.2 Run Migrations on Production

```bash
# 1. Get AWS credentials
export AWS_PROFILE=dntech-prod
export AWS_REGION=ap-southeast-1

# 2. Update .env.production with secrets from Secrets Manager
export DB_HOST=$(terraform output -raw rds_endpoint)
export DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id dntech-erp/prod/db-password \
  --query SecretString --output text)
export DB_USER=erp_user
export DB_NAME=erp_prod

# 3. Run migrations
cd backend
npm run db:migrate

# 4. Verify schema created
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"
# Should list all tables

# 5. Seed demo data (optional, usually NOT for prod)
# npm run db:seed
```

### 3.3 Database Backup Procedure

```bash
# 1. Verify automated backups
aws rds describe-db-instances \
  --db-instance-identifier erp-prod-db \
  --query 'DBInstances[0].[BackupRetentionPeriod,PreferredBackupWindow]'

# 2. Create manual snapshot before major changes
aws rds create-db-snapshot \
  --db-instance-identifier erp-prod-db \
  --db-snapshot-identifier erp-prod-snapshot-$(date +%Y%m%d)

# 3. List snapshots
aws rds describe-db-snapshots --query 'DBSnapshots[].DBSnapshotIdentifier'

# 4. Test restore (monthly)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier erp-prod-db-restore-test \
  --db-snapshot-identifier erp-prod-snapshot-20240703
```

---

## 4. KUBERNETES CLUSTER SETUP

### 4.1 Configure kubectl

```bash
# 1. Get EKS cluster info
CLUSTER_NAME=$(terraform output -raw eks_cluster_name)
REGION=$(terraform output -raw aws_region)

# 2. Update kubeconfig
aws eks update-kubeconfig \
  --region $REGION \
  --name $CLUSTER_NAME \
  --profile dntech-prod

# 3. Verify connection
kubectl cluster-info
kubectl get nodes

# Expected output:
# NAME                                          STATUS   ROLES    AGE   VERSION
# ip-10-0-xx-xxx.ap-southeast-1.compute.internal   Ready    <none>   5m    v1.28.x
```

### 4.2 Create Namespaces & RBAC

```bash
# 1. Create namespace
kubectl create namespace dntech-prod

# 2. Create service account
kubectl create serviceaccount dntech-erp -n dntech-prod

# 3. Create role (read-only for monitoring)
kubectl create role dntech-monitor \
  --verb=get,list \
  --resource=pods,services,deployments \
  -n dntech-prod

# 4. Bind role to service account
kubectl create rolebinding dntech-monitor \
  --serviceaccount=dntech-prod:dntech-erp \
  --role=dntech-monitor \
  -n dntech-prod

# 5. Verify
kubectl get sa -n dntech-prod
kubectl get roles -n dntech-prod
```

### 4.3 Install Kubernetes Addons

```bash
# 1. Install Metrics Server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2. Install Ingress Controller (AWS ALB)
# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME

# 3. Verify
kubectl get pods -n kube-system | grep alb
```

---

## 5. HELM CHART DEPLOYMENT

### 5.1 Helm Chart Structure

```
k8s/helm/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-prod.yaml        # Production overrides
├── templates/
│   ├── deployment.yaml     # API deployment
│   ├── service.yaml        # Service
│   ├── ingress.yaml        # AWS ALB Ingress
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   ├── configmap.yaml      # Config
│   ├── secrets.yaml        # Secrets reference
│   ├── serviceaccount.yaml
│   ├── pdb.yaml            # Pod Disruption Budget
│   └── tests/
│       └── test-connection.yaml
└── charts/                 # Dependencies (PostgreSQL, Redis)
```

### 5.2 Helm Values (Production)

```yaml
# k8s/helm/values-prod.yaml

replicaCount: 3  # Multiple instances for HA

image:
  repository: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/dntech-erp
  tag: "1.0.0"
  pullPolicy: IfNotPresent

imagePullSecrets:
  - name: ecr-secret

strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0  # Maintain availability during updates

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 4Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3

env:
  - name: NODE_ENV
    value: "production"
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: dntech-secrets
        key: db-host
  - name: DB_PORT
    value: "5432"
  - name: DB_USER
    valueFrom:
      secretKeyRef:
        name: dntech-secrets
        key: db-user
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: dntech-secrets
        key: db-password
  # ... more env vars

service:
  type: ClusterIP
  port: 3000
  targetPort: 3000

ingress:
  enabled: true
  className: alb
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-southeast-1:123456789:certificate/xxx
  hosts:
    - host: app.dntech-erp.com
      paths:
        - path: /
          pathType: Prefix
    - host: api.dntech-erp.com
      paths:
        - path: /
          pathType: Prefix

pdb:
  enabled: true
  minAvailable: 1  # At least 1 pod always available
```

### 5.3 Deploy with Helm

```bash
# 1. Validate chart
helm lint k8s/helm

# 2. Dry-run first
helm install dntech-erp k8s/helm \
  --namespace dntech-prod \
  --values k8s/helm/values-prod.yaml \
  --dry-run \
  --debug

# 3. Actual deployment
helm install dntech-erp k8s/helm \
  --namespace dntech-prod \
  --values k8s/helm/values-prod.yaml

# 4. Check deployment status
kubectl rollout status deployment/dntech-erp -n dntech-prod

# 5. Verify pods running
kubectl get pods -n dntech-prod

# 6. View logs
kubectl logs -n dntech-prod deployment/dntech-erp -f

# 7. Upgrade later (for new releases)
helm upgrade dntech-erp k8s/helm \
  --namespace dntech-prod \
  --values k8s/helm/values-prod.yaml
```

---

## 6. SSL/TLS & DNS CONFIGURATION

### 6.1 AWS Certificate Manager (ACM)

```bash
# 1. Request certificate
aws acm request-certificate \
  --domain-name app.dntech-erp.com \
  --domain-name api.dntech-erp.com \
  --domain-name dntech-erp.com \
  --validation-method DNS \
  --region ap-southeast-1

# 2. Validate DNS (add CNAME records to DNS provider)
# AWS will show required CNAME records in ACM console
# Add them to your DNS provider (Cloudflare, Route53, etc.)

# 3. Verify certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:ap-southeast-1:123456789:certificate/xxx \
  --query 'Certificate.DomainValidationOptions'
```

### 6.2 Route53 DNS (if using AWS)

```bash
# 1. Create hosted zone
aws route53 create-hosted-zone \
  --name dntech-erp.com \
  --caller-reference $(date +%s)

# 2. Get ALB endpoint
ALB_ENDPOINT=$(kubectl get service -n kube-system aws-load-balancer-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# 3. Create DNS records
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://dns-changes.json

# dns-changes.json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.dntech-erp.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",  # ALB zone ID
          "DNSName": "$ALB_ENDPOINT",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
```

### 6.3 Verify DNS & SSL

```bash
# Test DNS resolution
nslookup app.dntech-erp.com

# Test SSL certificate
openssl s_client -connect app.dntech-erp.com:443

# Expected: Certificate valid, no errors
```

---

## 7. MONITORING & LOGGING SETUP

### 7.1 Prometheus Setup

```bash
# 1. Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# 3. Expose Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# 4. Access: http://localhost:9090
```

### 7.2 CloudWatch Logs

```bash
# 1. Update backend to ship logs to CloudWatch
# Environment variables:
LOG_DRIVER=cloudwatch
CLOUDWATCH_LOG_GROUP=/aws/eks/dntech-prod
CLOUDWATCH_REGION=ap-southeast-1

# 2. Configure IAM role (Terraform should have done this)
# Verify:
aws iam get-role --role-name eks-node-role
aws iam list-role-policies --role-name eks-node-role | grep CloudWatch
```

### 7.3 Grafana Dashboard

```bash
# 1. Access Grafana (port-forward or Ingress)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# 2. Login: admin / prom-operator

# 3. Create dashboards:
# - API request metrics
# - Database connection pool
# - Pod CPU/Memory usage
# - Error rate & latency
```

---

## 8. BACKUP & DISASTER RECOVERY

### 8.1 Database Backups

```bash
# 1. RDS automatic backups (done by Terraform)
aws rds describe-db-instances \
  --db-instance-identifier erp-prod-db \
  --query 'DBInstances[0].BackupRetentionPeriod'

# 2. Cross-region backup replication
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:ap-southeast-1:123456789:snapshot:xxx \
  --target-db-snapshot-identifier erp-prod-backup-replica \
  --destination-region us-east-1
```

### 8.2 Persistent Volume Snapshots (EBS)

```bash
# 1. Create snapshot
aws ec2 create-snapshot \
  --volume-id vol-123456 \
  --description "EKS node backup"

# 2. Copy to another region
aws ec2 copy-snapshot \
  --source-region ap-southeast-1 \
  --source-snapshot-id snap-123456 \
  --destination-region us-east-1
```

### 8.3 Test Disaster Recovery

**Monthly DR Test:**
```bash
# 1. Restore RDS from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier erp-prod-db-restore-test \
  --db-snapshot-identifier erp-prod-snapshot-latest

# 2. Verify restore completed
aws rds wait db-instance-available \
  --db-instance-identifier erp-prod-db-restore-test

# 3. Run smoke tests
npm run test:e2e -- --config-file=staging.config.js

# 4. Delete restore instance
aws rds delete-db-instance \
  --db-instance-identifier erp-prod-db-restore-test \
  --skip-final-snapshot
```

---

## 9. SECURITY HARDENING

### 9.1 Network Security

```bash
# 1. Verify security groups
aws ec2 describe-security-groups --filters Name=group-name,Values=dntech-prod

# 2. Expected inbound rules:
# - ALB (443): 0.0.0.0/0 (HTTPS)
# - RDS (5432): EKS nodes only
# - Redis (6379): EKS nodes only

# 3. No SSH access to nodes (should use SSM Session Manager)
aws ssm start-session --target i-1234567890abcdef0
```

### 9.2 Secrets Rotation

```bash
# 1. Rotate database password (monthly)
aws rds modify-db-instance \
  --db-instance-identifier erp-prod-db \
  --master-user-password $(openssl rand -base64 32) \
  --apply-immediately

# 2. Update in Secrets Manager
aws secretsmanager update-secret \
  --secret-id dntech-erp/prod/db-password \
  --secret-string "new-password"

# 3. Restart pods to pick up new password
kubectl rollout restart deployment/dntech-erp -n dntech-prod
```

### 9.3 Pod Security Policies

```yaml
# k8s/helm/templates/psp.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: dntech-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'MustRunAs'
  readOnlyRootFilesystem: false
```

---

## 10. PRODUCTION TESTING & VALIDATION

### 10.1 Smoke Tests

```bash
# 1. API health check
curl https://api.dntech-erp.com/api/health

# 2. Database connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -n dntech-prod -- \
  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT NOW();"

# 3. Redis connectivity
kubectl run -it --rm debug --image=redis:7 --restart=Never -n dntech-prod -- \
  redis-cli -h $REDIS_HOST ping

# 4. Login test
curl -X POST https://api.dntech-erp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Demo1234!"}'
```

### 10.2 Load Testing

```bash
# 1. Using k6
k6 run load-test.js --vus 100 --duration 15m \
  --env TARGET_URL=https://api.dntech-erp.com

# 2. Verify metrics
# - p95 latency < 500ms
# - Error rate < 0.5%
# - Database CPU < 70%
# - Pod memory usage stable
```

---

## 11. ROLLBACK PROCEDURE

### 11.1 Rollback Helm Release

```bash
# If deployment fails, rollback to previous version
helm rollback dntech-erp 1 -n dntech-prod

# View release history
helm history dntech-erp -n dntech-prod

# Verify rollback
kubectl rollout status deployment/dntech-erp -n dntech-prod
```

### 11.2 Rollback Database Migration

```bash
# If migration failed, restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier erp-prod-db-rollback \
  --db-snapshot-identifier erp-prod-snapshot-pre-migration

# Swap CNAME to point to rolled-back DB
aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC ...

# Scale pods to 0 then back up
kubectl scale deployment dntech-erp --replicas=0 -n dntech-prod
kubectl scale deployment dntech-erp --replicas=3 -n dntech-prod
```

---

## 12. POST-DEPLOYMENT OPERATIONS

### 12.1 Ongoing Monitoring

**Daily:**
- Check Prometheus for alerts
- Review CloudWatch logs for errors
- Verify backup completion

**Weekly:**
- Review performance metrics
- Check disk usage (RDS, EBS)
- Review security logs

**Monthly:**
- Disaster recovery test
- Security patching
- Cost review

### 12.2 Scaling Procedures

```bash
# 1. Manual pod scaling
kubectl scale deployment dntech-erp \
  --replicas=5 \
  -n dntech-prod

# 2. Manual node scaling
aws eks update-nodegroup-config \
  --cluster-name $CLUSTER_NAME \
  --nodegroup-name $NODEGROUP_NAME \
  --scaling-config minSize=3,maxSize=15,desiredSize=5

# 3. Auto-scaling via HPA (configured in Helm)
kubectl get hpa -n dntech-prod
```

### 12.3 Updates & Patching

```bash
# 1. Update Kubernetes version (plan for 24-hour maintenance window)
aws eks update-cluster-version \
  --name $CLUSTER_NAME \
  --kubernetes-version 1.29

# 2. Update node group AMI
aws eks update-nodegroup-version \
  --cluster-name $CLUSTER_NAME \
  --nodegroup-name $NODEGROUP_NAME

# 3. Update application (new version)
helm upgrade dntech-erp k8s/helm \
  --namespace dntech-prod \
  --values k8s/helm/values-prod.yaml \
  --set image.tag="1.0.1"
```

---

## 📋 DEPLOYMENT CHECKLIST

Before going live:

```
PRE-DEPLOYMENT:
☐ All tests passing
☐ Terraform plan reviewed
☐ Secrets configured
☐ Monitoring setup verified
☐ Backup procedure tested

DEPLOYMENT DAY:
☐ Terraform apply successful
☐ EKS cluster verified
☐ Database migrated
☐ Helm deployed successfully
☐ DNS updated
☐ SSL certificate working
☐ Health checks passing
☐ Load test successful

POST-DEPLOYMENT:
☐ Smoke tests passing
☐ Users can login
☐ Data integrity verified
☐ Monitoring dashboard live
☐ On-call rotation started
☐ Status page updated
☐ Team debriefing
```

---

**Estimated Deployment Time:** 3-4 days (first time)  
**Owner:** DevOps Engineer  
**Status:** Ready for production deployment  
**Last Updated:** 3 July 2026

