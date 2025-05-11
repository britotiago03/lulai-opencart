#!/bin/bash

# Function to print colorful messages
print_message() {
    echo -e "\033[1;34m>>> $1\033[0m"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Prompt for admin email and name (for both services)
read -p "Enter admin email for ecommerce-store: " ECOMMERCE_ADMIN_EMAIL
read -p "Enter admin email for chatbot-platform: " CHATBOT_ADMIN_EMAIL
read -p "Enter admin name for chatbot-platform: " CHATBOT_ADMIN_NAME

# Update environment variables in docker-compose files
print_message "Updating environment variables in docker-compose files..."

# Update ecommerce-store docker-compose.yml
if [ -f "./ecommerce-store/docker-compose.yml" ]; then
    # Use sed with a pattern that specifically targets the ADMIN_EMAIL line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires an empty string as the extension for in-place editing
        sed -i '' -E 's/([ ]+ADMIN_EMAIL:[ ]+")[^"]*(")/\1'"$ECOMMERCE_ADMIN_EMAIL"'\2/' ./ecommerce-store/docker-compose.yml
    else
        # Linux version
        sed -i -E 's/([ ]+ADMIN_EMAIL:[ ]+")[^"]*(")/\1'"$ECOMMERCE_ADMIN_EMAIL"'\2/' ./ecommerce-store/docker-compose.yml
    fi
    echo "  Ecommerce store docker-compose.yml updated successfully."
else
    echo "Error: ecommerce-store/docker-compose.yml not found!"
    exit 1
fi

# Update chatbot-platform docker-compose.yml
if [ -f "./chatbot-platform/docker-compose.yml" ]; then
    # Update ADMIN_EMAIL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires an empty string as the extension for in-place editing
        sed -i '' -E 's/([ ]+ADMIN_EMAIL:[ ]+")[^"]*(")/\1'"$CHATBOT_ADMIN_EMAIL"'\2/' ./chatbot-platform/docker-compose.yml
        sed -i '' -E 's/([ ]+ADMIN_NAME:[ ]+")[^"]*(")/\1'"$CHATBOT_ADMIN_NAME"'\2/' ./chatbot-platform/docker-compose.yml
    else
        # Linux version
        sed -i -E 's/([ ]+ADMIN_EMAIL:[ ]+")[^"]*(")/\1'"$CHATBOT_ADMIN_EMAIL"'\2/' ./chatbot-platform/docker-compose.yml
        sed -i -E 's/([ ]+ADMIN_NAME:[ ]+")[^"]*(")/\1'"$CHATBOT_ADMIN_NAME"'\2/' ./chatbot-platform/docker-compose.yml
    fi
    echo "  Chatbot platform docker-compose.yml updated successfully."
else
    echo "Error: chatbot-platform/docker-compose.yml not found!"
    exit 1
fi

# Deploy database
print_message "Deploying database..."
cd database
docker-compose down -v
docker-compose up --build -d
cd ..

# Deploy ecommerce-store
print_message "Deploying ecommerce-store..."
cd ecommerce-store
docker-compose down -v
docker-compose up --build -d
cd ..

# Deploy nextjs-chatbot
print_message "Deploying nextjs-chatbot..."
cd nextjs-chatbot
docker-compose down -v
docker-compose up --build -d
cd ..

# Deploy chatbot-platform
print_message "Deploying chatbot-platform..."
cd chatbot-platform
docker-compose down -v
docker-compose up --build -d
cd ..

print_message "Deployment completed successfully!"
echo ""
echo "Access your applications at:"
echo "- Ecommerce store: http://localhost:3000"
echo "- Chatbot platform: http://localhost:3001"
echo ""
echo "Check your email for admin setup links for both platforms."