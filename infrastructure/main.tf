terraform {
  backend "remote" {
    organization = "goobs"

    workspaces {
      name = "beeg-yoshi-f1"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.54"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  region = "us-east-1"
}