resource "aws_cloudwatch_log_group" "cloudwatch_log_group" {
  name = "/aws/lambda/${var.lambda_name}"
}

resource "aws_iam_policy" "base_execution_role" {
  name_prefix = var.lambda_name
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : "logs:CreateLogGroup",
        Resource : "arn:aws:logs:${var.region}:${var.acc_number}:*"
      },
      {
        Effect : "Allow",
        "Action" : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource : "arn:aws:logs:${var.region}:${var.acc_number}:log-group:/aws/lambda/${var.lambda_name}:*"
      }
    ]
  })
}