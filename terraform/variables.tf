variable "aws_region" {
  description = "AWS Region"
  type        = "string"
}

variable "app_name" {
  description = "Application Name"
  type        = "string"
  default     = "berrow-books-app"
}

variable "github_repository" {
  description = "GitHub Repository URL (e.g., https://github.com/user/repo)"
  type        = "string"
}

variable "github_access_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = "string"
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth Secret"
  type        = "string"
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend API Key"
  type        = "string"
  sensitive   = true
}

variable "nextauth_email_owner" {
  description = "Allowed owner email for NextAuth"
  type        = "string"
}
