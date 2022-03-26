module "lambda_cloudwatch" {
  source = "./modules/lambda_cloudwatch"

  lambda_name = "f1-drivers-get-dev"
  acc_number  = var.acc_number
}

resource "aws_iam_role" "f1_drivers_get" {
  name               = "f1-drivers-get-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "f1_drivers_get_cloudwatch" {
  role       = aws_iam_role.f1_drivers_get.name
  policy_arn = module.lambda_cloudwatch.policy_arn
}

resource "aws_iam_role_policy_attachment" "f1_drivers_get_vpc" {
  role       = aws_iam_role.f1_drivers_get.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
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

  vpc_config {
    subnet_ids         = [aws_default_subnet.default_subnet_az1.id, "subnet-934933f4"]
    security_group_ids = [aws_default_security_group.default.id]
  }

  environment {
    variables = {
      DATABASE_ENDPOINT = aws_db_proxy.beeg_yoshi_f1.endpoint
    }
  }
}