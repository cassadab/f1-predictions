module "update_drivers_lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.13.0"

  function_name = "f1-update-drivers"
  description   = "Update driver points"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  role_name     = "f1-update-drivers"

  create_package          = false
  local_existing_package  = "default_lambda.zip"
  ignore_source_code_hash = true
  timeout                 = 5

  environment_variables = {
    "ERGAST_BASE_URL" = "http://ergast.com/api/f1"
    "SEASON"          = var.season
    "ROUND"           = "last"
  }
  tags = {
    Project = "beeg-yoshi-f1"
  }
}

resource "aws_iam_role_policy_attachment" "update_drivers_dynamo" {
  role       = module.update_drivers_lambda.lambda_role_name
  policy_arn = aws_iam_policy.beeg_yoshi_dynamo_read_write.arn
}