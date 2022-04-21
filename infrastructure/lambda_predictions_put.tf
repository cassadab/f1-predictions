module "predictions_put_lambda" {
  source = "./modules/lambda"

  lambda_name = "f1-predictions-put"
  description = "Create new prediction"
  acc_number  = var.acc_number
  timeout     = 5
}