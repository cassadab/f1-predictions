resource "aws_vpc" "beeg_yoshi_f1" {
  cidr_block = "10.0.0.0/16"

  tags = {
    "Name" = "BeegYoshiF1"
  }
}

resource "aws_subnet" "zone1" {
  vpc_id            = aws_vpc.beeg_yoshi_f1.id
  cidr_block        = "10.0.0.0/17"
  availability_zone = "us-east-1a"

  tags = {
    Name = "BeegYoshi-1a"
  }
}

resource "aws_subnet" "zone2" {
  vpc_id            = aws_vpc.beeg_yoshi_f1.id
  cidr_block        = "10.0.128.0/17"
  availability_zone = "us-east-1b"

  tags = {
    Name = "BeegYoshi-1b"
  }
}

data "aws_subnet_ids" "beeg_yoshi_f1" {
  vpc_id = var.vpc_id
}

resource "aws_db_subnet_group" "beeg_yoshi_f1" {
  name       = "beeg-yoshi-f1"
  subnet_ids = [aws_subnet.zone1.id, aws_subnet.zone2.id]

  tags = {
    Name = "BeegYoshiF1"
  }
}

resource "aws_security_group" "beeg_yoshi_f1" {
  name        = "Allow MySQL"
  description = "Allow MySQL traffic"
  vpc_id      = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "RDS MySQL"
  }
}

resource "aws_security_group_rule" "mysql_ingress" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.beeg_yoshi_f1.id

  security_group_id = aws_security_group.beeg_yoshi_f1.id
}

resource "aws_security_group_rule" "mysql_egress" {
  type                     = "egress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.beeg_yoshi_f1.id
  security_group_id        = aws_security_group.beeg_yoshi_f1.id
}