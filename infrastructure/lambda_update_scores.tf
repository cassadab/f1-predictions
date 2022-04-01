module "update_scores_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-update-scores-dev"
  description = "Update driver standings and prediction rankings"
  acc_number  = var.acc_number
  timeout     = 10
}

resource "aws_iam_role_policy_attachment" "update_scores_invoke" {
  role = module.update_scores_lambda.execution_role
  
}