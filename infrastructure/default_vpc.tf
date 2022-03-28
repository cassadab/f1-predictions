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
}

resource "aws_subnet" "zone2" {
  vpc_id            = aws_vpc.beeg_yoshi_f1.id
  cidr_block        = "10.0.128.0/17"
  availability_zone = "us-east-1b"
}

# resource "aws_db_subnet_group" "beeg_yoshi_f1" {
#   name       = "beeg-yoshi-f1"
#   subnet_ids = [aws_subnet.zone1.id]

#   tags = {
#     Name = "BeegYoshiF1"
#   }
# }

resource "aws_security_group" "beeg_yoshi_f1" {
  name        = "Allow MySQL"
  description = "Allow MySQL traffic"
  vpc_id      = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "RDS MySQL"
  }
}

resource "aws_security_group_rule" "beeg_yoshi_f1" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  cidr_blocks       = [aws_vpc.beeg_yoshi_f1.cidr_block]
  security_group_id = aws_security_group.beeg_yoshi_f1.id
}