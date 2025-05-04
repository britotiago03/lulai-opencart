# LulAI Agent Development: Building the Plugin AI for Autonomous E-commerce Solutions

A full-stack project combining an e-commerce store with an integrated AI chatbot platform, following a service-based architecture style.

## 🚀 Project Overview

This project implements a service-based architecture consisting of three major components:

1. **Chatbot Platform (`chatbot-platform/`)**: A web-based dashboard where users can create, configure, and manage AI chatbots for their online stores. It also hosts the chatbot API that client websites use.

2. **E-Commerce Store (`ecommerce-store/`)**: A Next.js-based online store that serves as a testing ground for the chatbot integration. It simulates a real e-commerce environment with product listings, shopping cart, and checkout.

3. **Nextjs-Chatbot (`nextjs-chatbot/`)**: A middleware component that connects the chatbot platform with the e-commerce store, handling the communication between them.

The system uses a shared PostgreSQL database with partitioned schemas:
- `chatbot_schema`: Used by both the chatbot-platform and nextjs-chatbot services
- `ecommerce_schema`: Used exclusively by the ecommerce-store service

Each component is containerized using Docker, making the system modular, maintainable, and easy to deploy.

### Architecture Style

This project follows a service-based architecture, which offers several benefits:
- Domain-partitioned services with clear boundaries
- Better fault tolerance and modularity
- Easier testing and deployment
- Good balance between distribution benefits and simplicity
- Preservation of ACID transactions within domain services

## 🤖 Chatbot Capabilities

The AI chatbot developed in this project is designed to assist users with e-commerce navigation and shopping. It can:

- **Navigate the E-commerce Store**: Guide users to any page including sign up, login, cart, product listings, product details, and checkout pages
- **Manage Shopping Cart**: Add products to cart, modify quantities, or remove items
- **Navigate to Checkout**: Direct users to the checkout page when they're ready to complete their purchase
- **Answer Product Questions**: Provide information about products, availability, and specifications
- **Direct to Account Pages**: Navigate users to registration and login pages when requested
- **Provide Basic Product Recommendations**: Suggest products based on what the user is specifically asking for or interested in
- **General Shopping Assistance**: Help users find what they're looking for within the store

The chatbot seamlessly integrates with the e-commerce platform, creating an intuitive and helpful shopping assistant that enhances the user experience.

## 🛠 Prerequisites

- **Docker** and **Docker Compose** installed on your system
- Email access (to receive admin setup links)
- **Docker must be running** before executing the deployment scripts

## 📥 Quick Start

### Automated Deployment

1. Clone the repository
   ```sh
   git clone <your-repository-url>
   ```

2. **Ensure Docker is running** before proceeding with deployment

3. Run the deployment script:
  - **macOS/Linux**:
    ```sh
    chmod +x deploy.sh
    ./deploy.sh
    ```
  - **Windows** (Using PowerShell):
    ```sh
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\deploy.ps1
    ```

4. Follow the prompts to enter admin email addresses and names.

5. Once deployment is complete, access:
  - E-commerce store: http://localhost:3000
  - Chatbot platform: http://localhost:3001

### Manual Deployment

If you prefer manual deployment, follow these steps:

1. **Ensure Docker is running**

2. Update environment variables:
  - In `ecommerce-store/docker-compose.yml`: Change the `ADMIN_EMAIL` value
  - In `chatbot-platform/docker-compose.yml`: Change the `ADMIN_NAME` and `ADMIN_EMAIL` values

3. Deploy each component:
   ```sh
   # Database
   cd database
   docker-compose down -v
   docker-compose up --build -d
   cd ..

   # E-commerce store
   cd ecommerce-store
   docker-compose down -v
   docker-compose up --build -d
   cd ..

   # Nextjs-chatbot
   cd nextjs-chatbot
   docker-compose down -v
   docker-compose up --build -d
   cd ..

   # Chatbot platform
   cd chatbot-platform
   docker-compose down -v
   docker-compose up --build -d
   cd ..
   ```

## 📊 Admin Setup

### E-Commerce Store Admin

1. After deployment, check the email you provided as `ADMIN_EMAIL` for ecommerce-store
2. Open the admin setup link in the email
3. Follow the instructions to set up your admin account
4. Use the admin dashboard to manage products, orders, and settings

### Chatbot Platform Admin

1. After deployment, check the email you provided as `ADMIN_EMAIL` for chatbot-platform
2. Open the admin setup link in the email
3. Follow the instructions to set up your admin account
4. Use the admin dashboard to manage system settings and user accounts

## 🤖 Creating and Integrating a Chatbot

To create and integrate a chatbot with the e-commerce store:

1. Register as a user in the chatbot platform (http://localhost:3001)
2. Log in and navigate to "Create New Chatbot"
3. Fill in the chatbot details and configure its settings
4. In the API integration form, enter:
   ```
   http://lulai-ecommerce-store:3000/api/products
   ```
5. Download the generated widget file
6. Add the downloaded widget file to `ecommerce-store/public/`

7. Create or edit `ecommerce-store/src/components/widget.js`:
   ```tsx
   "use client";

   import { useEffect } from "react";

   const ChatWidget = () => {
       useEffect(() => {
           const script = document.createElement("script");
           script.src = "/your-widget-filename.js"; // Replace with the actual filename
           script.async = true;
           document.body.appendChild(script);
       }, []);

       return <lulai-chat-widget
           api-endpoint="http://localhost:3005/api/chat"
           api-key="YOUR_API_KEY" // Replace with your generated API key
       ></lulai-chat-widget>;
   };

   export default ChatWidget;
   ```

8. Edit `ecommerce-store/src/app/layout.tsx` to include the ChatWidget:
  - Add this import at the top of the file:
    ```tsx
    import ChatWidget from "@/components/widget";
    ```
  - Add the component inside the Providers tags, just before the closing `</Providers>` tag:
    ```tsx
    <Providers>
      <Navbar />
      <main>
        {children}
      </main>
      <ChatWidget />
    </Providers>
    ```

9. Rebuild the e-commerce store:
   ```sh
   cd ecommerce-store
   docker-compose down -v
   docker-compose up --build -d
   ```

10. Visit http://localhost:3000 to see your chatbot integrated with the e-commerce store

## 🔗 How All Components Work Together

1. A user logs into the Chatbot Platform and creates a chatbot
2. The chatbot is trained and linked to an API key
3. The e-commerce website embeds the chatbot script
4. Customers interact with the chatbot on the store
5. The chatbot API processes requests and provides responses

## ⏹ Stopping the Application

To stop all containers without deleting data:
```sh
docker-compose -f database/docker-compose.yml -f ecommerce-store/docker-compose.yml -f nextjs-chatbot/docker-compose.yml -f chatbot-platform/docker-compose.yml down
```

To stop and remove all data (including volumes):
```sh
docker-compose -f database/docker-compose.yml -f ecommerce-store/docker-compose.yml -f nextjs-chatbot/docker-compose.yml -f chatbot-platform/docker-compose.yml down -v
```

## 🗄️ Connecting to the Database

After the application is running:
```sh
docker exec -it postgres_db1 psql -U postgres -d ecommerce_db
```

## 🛠 Troubleshooting

- **Docker issues**: Ensure Docker is running before starting deployment
- **Port conflicts**: Make sure ports 3000, 3001, 3005, and 5432 are available
- **Network errors**: Check if containers can communicate with each other
- **Email not received**: Check spam folder or verify email configuration

For detailed logs:
```sh
docker-compose -f <component>/docker-compose.yml logs -f
```

## 🔄 Restarting Individual Components

To restart a specific component:
```sh
cd <component-directory>
docker-compose down
docker-compose up --build -d
```