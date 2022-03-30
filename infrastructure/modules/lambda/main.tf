variable "lambda_name" {
  type = string
}

variable "acc_number" {
  type      = string
  sensitive = true
}

variable "db_lambda_user" {
  type      = string
  sensitive = true
}

variable "handler" {
  type    = string
  default = "index.handler"
}

variable "memory_size" {
  type    = number
  default = 128
}

variable "rds_config" {
  type = object({
    required       = bool
    connect_policy = string
    endpoint       = string
    instance_arn   = string
    user           = string
  })
  sensitive = true
}

variable "runtime" {
  type    = string
  default = "nodejs14.x"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "timeout" {
  type    = number
  default = 3
}

variable "vpc_config" {
  type = object({
    required           = bool
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
}

output "execution_role_arn" {
  value     = aws_iam_policy.execution_role.arn
  sensitive = true
}
