module "update_cloudwatch" {
  source = "./modules/lambda_cloudwatch"

  lambda_name = "f1-update"
  acc_number  = var.acc_number
}

resource "aws_iam_role" "update_drivers" {
  name_prefix        = "f1-update"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_policy" "invoke_update_drivers_standings" {
  name_prefix = "beeg-yoshi-invoke-update-drivers-standings"
  description = "Allow invocation of f1-update-drivers-standings lambda"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "lambda:InvokeFunction",
        "Resource" : module.update_driver_standings_get_lambda.lambda_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "update_drivers_invoke" {
  role       = aws_iam_role.update_drivers.name
  policy_arn = aws_iam_policy.invoke_update_drivers_standings.arn
}

resource "aws_iam_role_policy_attachment" "update_drivers_cw" {
  role       = aws_iam_role.update_drivers.name
  policy_arn = module.update_cloudwatch.policy_arn
}

resource "aws_lambda_function" "lambda" {
  function_name = "f1-update"
  filename      = "default_lambda.zip"
  description   = "Initiate driver stanings update"
  role          = aws_iam_role.update_drivers.arn
  runtime       = "nodejs14.x"
  handler       = "index.handler"
  memory_size   = 128
  timeout       = 5

  environment {
    variables = {
      ERGAST_BASE_URL = "http://ergast.com/api/f1"
      ROUND           = "last"
      SEASON          = "2022"
    }
  }
}
