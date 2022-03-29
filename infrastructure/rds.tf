resource "aws_db_instance" "beeg_yoshi_f1" {
  identifier                          = "beeg-yoshi-f1"
  allocated_storage                   = 10
  engine                              = "mysql"
  engine_version                      = "5.7"
  instance_class                      = "db.t3.micro"
  db_name                             = "f1_predictions"
  username                            = var.db_user
  password                            = var.db_password
  iam_database_authentication_enabled = true
  db_subnet_group_name                = aws_db_subnet_group.beeg_yoshi_f1.name
  vpc_security_group_ids              = [aws_security_group.beeg_yoshi_f1.id]
}

resource "aws_secretsmanager_secret" "beeg_yoshi_f1" {}

resource "aws_secretsmanager_secret_version" "beeg_yoshi_f1" {
  secret_id = aws_secretsmanager_secret.beeg_yoshi_f1.id
  secret_string = jsonencode({
    "username"             = aws_db_instance.beeg_yoshi_f1.username
    "password"             = var.db_password
    "engine"               = "mysql"
    "host"                 = aws_db_instance.beeg_yoshi_f1.endpoint
    "port"                 = 3306
    "dbInstanceIdentifier" = aws_db_instance.beeg_yoshi_f1.id
  })
}

# Not using this currently 

# resource "aws_db_proxy" "beeg_yoshi_f1" {
#   name           = "beeg-yoshi-f1-proxy"
#   engine_family  = "MYSQL"
#   role_arn       = aws_iam_role.database_proxy.arn
#   require_tls    = true
#   vpc_subnet_ids = [aws_subnet.zone1.id]

#   auth {
#     auth_scheme = "SECRETS"
#     iam_auth    = "REQUIRED"
#     secret_arn  = aws_secretsmanager_secret.beeg_yoshi.arn
#   }
# }