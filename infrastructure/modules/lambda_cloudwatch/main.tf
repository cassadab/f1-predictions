# Creates a CloudWatch group and required policy arn 

variable "lambda_name" {
  type = string
}

variable "acc_number" {
  type = string
  sensitive = true
}

variable "region" {
  type = string
  default = "us-east-1"
}

output "policy_arn" {
  value = aws_iam_policy.base_execution_role.arn
  sensitive = true
}
