resource "aws_lambda_function" "lambda" {
  function_name = var.lambda_name
  filename      = "default_lambda.zip"
  description   = var.description
  role          = aws_iam_role.execution_role.arn
  runtime       = var.runtime
  handler       = var.handler
  memory_size   = var.memory_size
  timeout       = var.timeout
}