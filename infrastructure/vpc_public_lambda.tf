resource "aws_route_table" "public_lambda" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  route = []

  tags = {
    Name = "BeegYoshi Lambda Public"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_lambda.id
}

resource "aws_route_table" "private_lambda" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  route = []

  tags = {
    Name = "BeegYoshi Lambda Private"
  }
}

resource "aws_route_table_association" "private_zone_1" {
  subnet_id      = aws_subnet.zone1.id
  route_table_id = aws_route_table.private_lambda.id
}

resource "aws_route_table_association" "private_zone2" {
  subnet_id      = aws_subnet.zone1.id
  route_table_id = aws_route_table.private_lambda.id
}

resource "aws_internet_gateway" "lambda_gw" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "BeegYoshi Lambda"
  }
}
