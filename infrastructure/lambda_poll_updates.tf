module "poll_updates_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-poll-updates"
  description = "Poll F1 API for standings updates"
  acc_number  = var.acc_number
  timeout     = 3
}

resource "aws_iam_role_policy_attachment" "poll_updates" {
  role       = module.poll_updates_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read.arn
}
