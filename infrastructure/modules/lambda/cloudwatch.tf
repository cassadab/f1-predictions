module "lambda_cloudwatch" {
  source = "../lambda_cloudwatch"

  lambda_name = var.lambda_name
  acc_number  = var.acc_number
}