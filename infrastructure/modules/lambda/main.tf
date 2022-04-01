variable "lambda_name" {
  type = string
}

variable "acc_number" {
  type      = string
  sensitive = true
}

variable "description" {
  type = string
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
  default = {
    connect_policy = ""
    endpoint       = ""
    instance_arn   = ""
    required       = false
    user           = ""
  }
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
  default = {
    required           = false
    security_group_ids = []
    subnet_ids         = []
  }
}

output "execution_role_arn" {
  value     = aws_iam_role.execution_role.arn
  sensitive = true
}
