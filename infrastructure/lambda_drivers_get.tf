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

resource "aws_iam_role_policy_attachment" "f1_drivers_get_rds" {
  role       = aws_iam_role.f1_drivers_get.name
  policy_arn = aws_iam_policy.beeg_yoshi_rds_connect.arn
}

resource "aws_iam_role_policy_attachment" "f1_drivers_get_secret" {
  role       = aws_iam_role.f1_drivers_get.name
  policy_arn = aws_iam_policy.f1_mysql_secret.arn
}

resource "aws_lambda_function" "f1_drivers_get" {
  function_name = "f1-drivers-get-dev"
  filename      = "default_lambda.zip"
  description   = "Retrieve driver standings from database"
  role          = aws_iam_role.f1_drivers_get.arn
  runtime       = "nodejs14.x"
  handler       = "index.handler"
  memory_size   = 128
  timeout       = 10

  vpc_config {
    subnet_ids         = [aws_subnet.zone1.id, aws_subnet.zone2.id]
    security_group_ids = [aws_security_group.beeg_yoshi_f1.id]
  }

  environment {
    variables = {
      DATABASE_ENDPOINT = aws_db_instance.beeg_yoshi_f1.endpoint
    }
  }
}