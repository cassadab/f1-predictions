resource "aws_vpc" "beeg_yoshi_f1" {
  cidr_block = "10.0.0.0/16"

  tags = {
    "Name" = "BeegYoshiF1"
  }
}

resource "aws_subnet" "zone1" {
  vpc_id            = aws_vpc.beeg_yoshi_f1.id
  cidr_block        = "10.0.0.0/18"
  availability_zone = "us-east-1a"

  tags = {
    Name = "BeegYoshi-1a"
  }
}

resource "aws_subnet" "zone2" {
  vpc_id            = aws_vpc.beeg_yoshi_f1.id
  cidr_block        = "10.0.64.0/18"
  availability_zone = "us-east-1b"

  tags = {
    Name = "BeegYoshi-1b"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.beeg_yoshi_f1.id
  cidr_block = "10.0.192.0/18"

  tags = {
    Name = "BeegYoshi-Public"
  }
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

resource "aws_security_group" "public_internet" {
  name        = "Public Internet"
  description = "Allow traffic to/from the public internet"
  vpc_id      = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "Public Internet"
  }
}

resource "aws_security_group_rule" "inbound_internet" {
  type              = "ingress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.public_internet.id
}

resource "aws_security_group_rule" "outbound_internet" {
  type              = "egress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.public_internet.id
}