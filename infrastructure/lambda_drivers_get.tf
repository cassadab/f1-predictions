module "lambda_cloudwatch" {
  source = "./modules/lambda_cloudwatch"

  lambda_name = "f1-drivers-get-dev"
  acc_number  = var.acc_number
}

resource "aws_iam_role" "f1_drivers_get" {
  name               = "f1_drivers_get-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_base.json
}

resource "aws_iam_role_policy_attachment" "f1_drivers_get_cloudwatch" {
  role       = aws_iam_role.f1_drivers_get.name
  policy_arn = module.lambda_cloudwatch.policy_arn
}

resource "aws_lambda_function" "f1_drivers_get" {
  function_name = "f1-drivers-get-dev"
  filename      = "default_lambda.zip"
  description   = "Retrieve driver standings from database"
  role          = aws_iam_role.f1_drivers_get.arn
  runtime       = "nodejs14.x"
  handler       = "index.handler"
  memory_size   = 128
  timeout       = 3
}