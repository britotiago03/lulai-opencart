# Function to display colored messages
function Write-ColoredMessage {
    param([string]$message)
    Write-Host ">>> $message" -ForegroundColor Cyan
}

# Check if Docker is running
Write-ColoredMessage "Checking Docker status..."
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Prompt for admin email and name
$ecommerceAdminEmail = Read-Host "Enter admin email for ecommerce-store"
$chatbotAdminEmail = Read-Host "Enter admin email for chatbot-platform"
$chatbotAdminName = Read-Host "Enter admin name for chatbot-platform"

# Update environment variables in docker-compose files
Write-ColoredMessage "Updating environment variables in docker-compose files..."

# Update ecommerce-store docker-compose.yml
$ecommerceComposeFile = ".\ecommerce-store\docker-compose.yml"
if (Test-Path $ecommerceComposeFile) {
    $ecommerceContent = Get-Content $ecommerceComposeFile -Raw

    # Look for the pattern and replace it
    $pattern = '(?m)(\s+ADMIN_EMAIL:)\s*"[^"]*"'
    $replacement = "`$1 `"$ecommerceAdminEmail`""

    $updatedContent = $ecommerceContent -replace $pattern, $replacement
    Set-Content -Path $ecommerceComposeFile -Value $updatedContent

    Write-Host "  Ecommerce store docker-compose.yml updated successfully." -ForegroundColor Green
} else {
    Write-Host "Error: ecommerce-store\docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

# Update chatbot-platform docker-compose.yml
$chatbotComposeFile = ".\chatbot-platform\docker-compose.yml"
if (Test-Path $chatbotComposeFile) {
    $chatbotContent = Get-Content $chatbotComposeFile -Raw

    # Look for the pattern and replace ADMIN_EMAIL
    $emailPattern = '(?m)(\s+ADMIN_EMAIL:)\s*"[^"]*"'
    $emailReplacement = "`$1 `"$chatbotAdminEmail`""
    $updatedContent = $chatbotContent -replace $emailPattern, $emailReplacement

    # Look for the pattern and replace ADMIN_NAME
    $namePattern = '(?m)(\s+ADMIN_NAME:)\s*"[^"]*"'
    $nameReplacement = "`$1 `"$chatbotAdminName`""
    $updatedContent = $updatedContent -replace $namePattern, $nameReplacement

    Set-Content -Path $chatbotComposeFile -Value $updatedContent

    Write-Host "  Chatbot platform docker-compose.yml updated successfully." -ForegroundColor Green
} else {
    Write-Host "Error: chatbot-platform\docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

# Deploy each component
function Deploy-Component {
    param([string]$componentName, [string]$directoryName)

    Write-ColoredMessage "Deploying $componentName..."
    Set-Location -Path ".\$directoryName"
    docker-compose down -v
    docker-compose up --build -d
    Set-Location -Path ".."
}

# Deploy all components
Deploy-Component "database" "database"
Deploy-Component "ecommerce-store" "ecommerce-store"
Deploy-Component "nextjs-chatbot" "nextjs-chatbot"
Deploy-Component "chatbot-platform" "chatbot-platform"

Write-ColoredMessage "Deployment completed successfully!"
Write-Host ""
Write-Host "Access your applications at:" -ForegroundColor Yellow
Write-Host "- Ecommerce store: http://localhost:3000" -ForegroundColor Yellow
Write-Host "- Chatbot platform: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check your email for admin setup links for both platforms." -ForegroundColor Yellow