# Use the official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install virtualenv
RUN pip install --upgrade pip && pip install virtualenv

# Create and activate a virtual environment
RUN python -m venv /venv

# Set the virtual environment as the default Python environment
ENV PATH="/venv/bin:$PATH"

# Copy the requirements.txt and install dependencies in the virtual environment
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Python server code
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the FastAPI app using Uvicorn in the virtual environment
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
