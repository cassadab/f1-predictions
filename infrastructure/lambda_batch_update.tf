module "batch_update_cloudwatch" {
  source = "./modules/lambda_cloudwatch"

  lambda_name = "f1-batch-update"
  acc_number  = var.acc_number
}

resource "aws_iam_role" "batch_update" {
  name_prefix        = "f1-batch-update"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "batch_update_invoke" {
  role       = aws_iam_role.batch_update.name
  policy_arn = aws_iam_policy.invoke_calculate_scores.arn
}

resource "aws_iam_role_policy_attachment" "batch_update_cw" {
  role       = aws_iam_role.batch_update.name
  policy_arn = module.batch_update_cloudwatch.policy_arn
}

resource "aws_lambda_function" "lambda" {
  function_name = "f1-batch-update"
  filename      = "default_lambda.zip"
  description   = "Batch job to update driver standings and prediction scores"
  role          = aws_iam_role.batch_update.arn
  runtime       = "nodejs14.x"
  handler       = "index.handler"
  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      ERGAST_BASE_URL = "http://ergast.com/api/f1"
      ROUND           = "last"
      SEASON          = "2022"
    }
  }
}
