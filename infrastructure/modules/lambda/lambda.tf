resource "aws_lambda_function" "lambda" {
  function_name = var.lambda_name
  filename      = "default_lambda.zip"
  description   = var.description
  role          = aws_iam_role.execution_role.arn
  runtime       = var.runtime
  handler       = var.handler
  memory_size   = var.memory_size
  timeout       = var.timeout

  vpc_config {
    # If both values are unset, the vpc_config block is considered to be empty/unset
    subnet_ids         = var.vpc_config.subnet_ids
    security_group_ids = var.vpc_config.security_group_ids
  }

  environment {
    variables = {
      # TODO - don't set these if we dont need db
      DATABASE_ENDPOINT = var.rds_config.endpoint
      DATABASE_USERNAME = var.db_lambda_user
    }
  }
}