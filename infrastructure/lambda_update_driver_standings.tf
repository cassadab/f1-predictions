module "update_driver_standings_get_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-update-driver-standings"
  description = "Update local copy of driver standings"
  acc_number  = var.acc_number
  timeout     = 5
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