module "teams_get_lambda" {
  source = "./modules/lambda"

  lambda_name = "epl-teams-get"
  description = "Retrieve teams standings from database"
  acc_number  = var.acc_number
  timeout     = 3
  env_vars = {
    SEASON = var.season
  }

}

resource "aws_iam_role_policy_attachment" "teams_get" {
  role       = module.teams_get_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_epl_dynamo_read.arn
}
