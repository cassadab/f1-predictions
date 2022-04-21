module "update_drivers_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-update-drivers"
  description = "Update drivers"
  acc_number  = var.acc_number
  timeout     = 3
}

resource "aws_iam_role_policy_attachment" "update_drivers_dynamo" {
  role       = module.update_drivers_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read_write.arn
}
