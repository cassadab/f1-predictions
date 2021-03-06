data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution_role" {
  name_prefix        = var.lambda_name
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.execution_role.name
  policy_arn = module.lambda_cloudwatch.policy_arn
}

resource "aws_iam_role_policy_attachment" "vpc" {
  count = var.vpc_config.required ? 1 : 0

  role       = aws_iam_role.execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "rds_connect" {
  count      = var.rds_config.required ? 1 : 0
  role       = aws_iam_role.execution_role.name
  policy_arn = var.rds_config.connect_policy
}