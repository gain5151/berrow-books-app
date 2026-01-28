resource "aws_amplify_app" "this" {
  name       = var.app_name
  repository = var.github_repository
  access_token = var.github_access_token

  # Next.js (App Router) build settings
  build_spec = <<-EOT
    version: 1
    applications:
      - frontend:
          phases:
            preBuild:
              commands:
                - cd web
                - npm ci
            build:
              commands:
                - npm run build
          artifacts:
            baseDirectory: web/.next
            files:
              - '**/*'
          cache:
            paths:
              - web/node_modules/**/*
              - web/.next/cache/**/*
  EOT

  # Enable SSR (Web Compute)
  platform = "WEB_COMPUTE"

  environment_variables = {
    NEXTAUTH_URL    = "https://main.${var.app_name}.amplifyapp.com" # 仮のURL、ブランチ名に依存
    NEXTAUTH_SECRET = var.nextauth_secret
    RESEND_API_KEY  = var.resend_api_key
    # DATABASE_URL は別途設定が必要（構築後に設定）
  }

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.this.id
  branch_name = "main"

  framework = "Next.js - SSR"
  
  # Auto-deploy on push to main
  enable_auto_build = true
}
