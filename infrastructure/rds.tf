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