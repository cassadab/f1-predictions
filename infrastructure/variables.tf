variable "acc_number" {
  description = "AWS account number"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_user" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_lambda_user" {
  type      = string
  sensitive = true
}

variable "season" {
  type    = string
  default = "2024"
}