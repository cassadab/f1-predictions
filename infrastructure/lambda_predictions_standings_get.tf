module "predictions_standings_get_dev_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-predictions-standings-get-dev"
  description = "Get high level prediction standings"
  acc_number  = var.acc_number
  timeout     = 5
}

resource "aws_iam_role_policy_attachment" "predictions_standings_get_dev" {
  role       = module.predictions_standings_get_dev_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read.arn
}