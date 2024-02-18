module "update_scores_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-update-scores"
  description = "Update scores"
  acc_number  = var.acc_number
  timeout     = 5
  env_vars = {
    SEASON = var.season
  }
}

resource "aws_iam_role_policy_attachment" "update_standings_dynamo" {
  role       = module.update_scores_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read_write.arn
}
