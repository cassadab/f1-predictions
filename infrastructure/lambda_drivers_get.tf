module "drivers_get_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-drivers-get"
  description = "Retrieve driver standings from database"
  acc_number  = var.acc_number
  timeout     = 3
  rds_config = {
    required       = true
    connect_policy = aws_iam_policy.beeg_yoshi_rds_connect.arn
    endpoint       = aws_db_instance.beeg_yoshi_f1.endpoint
    instance_arn   = aws_db_instance.beeg_yoshi_f1.arn
    user           = var.db_lambda_user
  }
  vpc_config = {
    required           = true
    subnet_ids         = [aws_subnet.zone1.id, aws_subnet.zone2.id]
    security_group_ids = [aws_security_group.beeg_yoshi_f1.id]
  }
}

module "drivers_get_dev_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-drivers-get-dev"
  description = "Retrieve driver standings from database"
  acc_number  = var.acc_number
  timeout     = 3
}

resource "aws_iam_role_policy_attachment" "drivers_get_dev" {
  role       = module.drivers_get_dev_lambda.execution_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read.arn
}

resource "aws_iam_policy" "drivers_get_invoke" {
  name_prefix = "beeg-yoshi-invoke-drivers-get"
  description = "Allow invocation of f1-drivers-get lambda"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "lambda:InvokeFunction",
        "Resource" : module.drivers_get_dev_lambda.lambda_arn
      }
    ]
  })
}
