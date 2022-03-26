resource "aws_db_instance" "beeg_yoshi_f1" {
  # TODO change name
  identifier        = "beeg-yoshi-f1-test"
  allocated_storage = 10
  engine            = "mysql"
  engine_version    = "5.7"
  instance_class    = "db.t3.micro"
  db_name           = "f1_predictions"
  username          = var.db_user
  password          = var.db_password
  # TODO security group ids
  # security_group_ids = =
}

resource "aws_secretsmanager_secret" "beeg_yoshi" {}

resource "aws_db_proxy" "f1_drivers_get" {
  name           = "beeg-yoshi-f1-proxy"
  engine_family  = "MYSQL"
  role_arn       = aws_iam_role.database_proxy.arn
  vpc_subnet_ids = [aws_default_subnet.default_subnet_az1.id, "subnet-934933f4"]

  auth {
    secret_arn = aws_secretsmanager_secret.beeg_yoshi.arn
  }
}