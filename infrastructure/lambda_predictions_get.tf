module "predictions_get_dev_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-predictions-get-dev"
  description = "Retrieve prediction details"
  acc_number  = var.acc_number
  timeout     = 3
}

resource "aws_iam_role_policy_attachment" "predictions_get_dev_dynamo" {
  role       = module.predictions_get_dev_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read.arn
}