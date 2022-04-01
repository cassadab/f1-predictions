module "update_scores_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-update-scores-dev"
  description = "Update driver standings and prediction rankings"
  acc_number  = var.acc_number
  timeout     = 10
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
    security_group_ids = [aws_security_group.beeg_yoshi_f1.id, aws_security_group.public_internet.id]
  }
}

resource "aws_iam_role_policy_attachment" "update_scores_invoke" {
  role       = module.update_scores_lambda.execution_role_name
  policy_arn = aws_iam_policy.invoke_calculate_scores.arn
}