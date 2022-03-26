resource "aws_iam_policy" "f1_mysql_secret" {
  name = "f1-mysql-secret"
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
        Resource : "arn:aws:secretsmanager:us-east-1:${var.acc_number}:beeg-yoshi-f1-mysql-Ffnly4"
      }
    ]
  })
}