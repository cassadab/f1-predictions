data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "rds_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "f1_mysql_secret" {
  name        = "beeg-yoshi-f1-secret"
  description = "Allow access to F1 predictions MySQL credentials"
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : [
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds"
        ],
        Resource : aws_secretsmanager_secret.beeg_yoshi_f1.arn
      }
    ]
  })
}

resource "aws_iam_role" "database_proxy" {
  name               = "beeg-yoshi-f1-db-proxy"
  description        = "Allow RDS to create database proxies"
  assume_role_policy = data.aws_iam_policy_document.rds_assume_role.json
}

resource "aws_iam_role_policy_attachment" "database_proxy_f1" {
  role       = aws_iam_role.database_proxy.name
  policy_arn = aws_iam_policy.f1_mysql_secret.arn
}