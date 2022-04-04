module "update_scores_cloudwatch" {
  source = "./modules/lambda_cloudwatch"

  lambda_name = "f1-update-scores-dev"
  acc_number  = var.acc_number
}

resource "aws_iam_role" "update_scores" {
  name_prefix        = "f1-update-scores-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "update_scores_invoke" {
  role       = aws_iam_role.update_scores.name
  policy_arn = aws_iam_policy.invoke_calculate_scores.arn
}

resource "aws_iam_role_policy_attachment" "update_scores_cw" {
  role       = aws_iam_role.update_scores.name
  policy_arn = module.update_scores_cloudwatch.policy_arn
}

resource "aws_lambda_function" "lambda" {
  function_name = "f1-update-scores-dev"
  filename      = "default_lambda.zip"
  description   = "Update driver standings and prediction scores"
  role          = aws_iam_role.update_scores.arn
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
