module "drivers_get_dev_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-drivers-get-dev"
  description = "Retrieve driver standings from database"
  acc_number  = var.acc_number
  timeout     = 3
  env_vars    = {
    SEASON    = var.season
  }

}

resource "aws_iam_role_policy_attachment" "drivers_get_dev" {
  role       = module.drivers_get_dev_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read.arn
}
