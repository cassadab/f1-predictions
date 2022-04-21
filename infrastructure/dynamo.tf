resource "aws_dynamodb_table" "beeg_yoshi_f1" {
  name           = "beeg-yoshi-f1"
  hash_key       = "pk"
  range_key      = "sk"
  billing_mode   = "PROVISIONED"
  read_capacity  = 10
  write_capacity = 10


  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "score"
    type = "N"
  }

  global_secondary_index {
    name               = "ScoresIndex"
    hash_key           = "pk"
    range_key          = "score"
    write_capacity     = 5
    read_capacity      = 5
    projection_type    = "INCLUDE"
    non_key_attributes = ["sk", "name", "country"]
  }
}

resource "aws_iam_policy" "beeg_yoshi_dynamo_read" {
  name_prefix = "beeg-yoshi-dynamo-read"
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : [
          "dynamodb:Query",
          "dynamodb:GetItem",
        ],
        Resource : [
          aws_dynamodb_table.beeg_yoshi_f1.arn,
          "${aws_dynamodb_table.beeg_yoshi_f1.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "beeg_yoshi_dynamo_read_write" {
  name_prefix = "beeg-yoshi-dynamo-read"
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : [
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ],
        Resource : [
          aws_dynamodb_table.beeg_yoshi_f1.arn,
          "${aws_dynamodb_table.beeg_yoshi_f1.arn}/index/*"
        ]
      }
    ]
  })
}