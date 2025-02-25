# Use a lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/api-talkpacific

# Copy the requirements file into the container
COPY requirements.txt ./

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 5050

# Specify the command to run the app
CMD ["uvicorn", "api_talkpacific.main:app", "--host", "0.0.0.0", "--port", "5050", "--reload"]
