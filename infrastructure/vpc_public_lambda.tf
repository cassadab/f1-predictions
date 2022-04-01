resource "aws_route_table" "public_lambda" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "BeegYoshi Lambda Public"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_lambda.id
}

# Direct all other traffic that is not staying in the subnet
resource "aws_route" "default_public_route" {
  route_table_id         = aws_route_table.public_lambda.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.lambda_gw.id
}

resource "aws_route_table" "private_lambda" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "BeegYoshi Lambda Private"
  }
}

resource "aws_route_table_association" "private_zone_1" {
  subnet_id      = aws_subnet.zone1.id
  route_table_id = aws_route_table.private_lambda.id
}

resource "aws_route_table_association" "private_zone2" {
  subnet_id      = aws_subnet.zone2.id
  route_table_id = aws_route_table.private_lambda.id
}

# Direct all other traffic that is not staying in the subnet
resource "aws_route" "default_private_route" {
  route_table_id         = aws_route_table.private_lambda.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.beeg_yoshi_f1.id
}

resource "aws_internet_gateway" "lambda_gw" {
  vpc_id = aws_vpc.beeg_yoshi_f1.id

  tags = {
    Name = "BeegYoshi Lambda"
  }
}

resource "aws_nat_gateway" "beeg_yoshi_f1" {
  allocation_id     = aws_eip.public_lambda.id
  subnet_id         = aws_subnet.public.id
  connectivity_type = "public"
}

resource "aws_eip" "public_lambda" {}