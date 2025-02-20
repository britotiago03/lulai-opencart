# E-Commerce Store (Next.js + PostgreSQL + Docker)

## 🚀 Getting Started
This project is a Next.js-based eCommerce store that requires **Docker** to run. The backend is powered by **PostgreSQL**, and everything is containerized for easy setup.

## 🛠 Prerequisites
- **Docker** and **Docker Compose** installed on your system.

## 📥 Clone the Repository
```sh
git clone <your-repository-url>
cd ecommerce-store
```

## ▶️ Start the Application
To build and run the application, execute the following commands:

```sh
cd ecommerce-store  # Ensure you are in the correct directory
docker-compose down -v  # Stops and removes existing containers and volumes (optional)
docker-compose up --build -d  # Builds and starts the containers in detached mode
```

If you **haven't changed the code** since the last time you ran the app, you can simply start it with:
```sh
cd ecommerce-store  # Ensure you are in the correct directory
docker-compose up -d  # Starts the containers without rebuilding
```

Once running, open your browser and visit:
- **http://localhost:3000** to access the website.

## ⏹ Stop the Application
To stop the running containers without deleting the database data:
```sh
cd ecommerce-store  # Ensure you are in the correct directory
docker-compose down
```

To stop the containers and **delete the database data**:
```sh
cd ecommerce-store  # Ensure you are in the correct directory
docker-compose down -v
```

## 🗄️ Connect to the Database (PostgreSQL)
After the app is running, you can access the database inside Docker with:

```sh
docker exec -it postgres_db psql -U postgres -d ecommerce_db
```

This will open the PostgreSQL interactive shell where you can run SQL queries.

## 🛠 Development & Debugging
- Make sure Docker is running before starting the app.
- Check logs with:
  ```sh
  docker-compose logs -f
  ```
- If you face issues, try running:
  ```sh
  cd ecommerce-store  # Ensure you are in the correct directory
  docker-compose down -v && docker-compose up --build -d
  ```

## 📜 License
This project is open-source. Feel free to modify and improve!