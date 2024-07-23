module "predictions_put_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-predictions-put"
  description = "Create new prediction"
  acc_number  = var.acc_number
  timeout     = 5
  env_vars = {
    SEASON = var.season
  }
}

resource "aws_iam_role_policy_attachment" "put_drivers_dynamo" {
  role       = module.predictions_put_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read_write.arn
}