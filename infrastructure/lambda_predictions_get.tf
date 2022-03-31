module "lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-predictions-get-dev"
  description = "Retrieve list of predictions"
  acc_number  = var.acc_number
  timeout     = 10
  rds_config = {
    required       = true
    connect_policy = aws_iam_policy.beeg_yoshi_rds_connect.name
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