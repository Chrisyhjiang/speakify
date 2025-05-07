# Speakify: Serverless Text-to-Speech Application

**Speakify** is a serverless application designed to convert text files into speech using AWS services, including **Lambda**, **API Gateway**, **S3**, **Polly**, and **SNS**. The system processes text files uploaded to an **S3 input bucket**, generates audio files using **Amazon Polly**, and stores the resulting audio files in a dedicated **S3 output bucket**. Upon successful conversion, notifications are sent to users via **SNS**.

---

## Frontend

The frontend of speakify is a modern web application built using:

- **React**: For building the user interface.
- **TailwindCSS**: For styling with utility-first CSS.
- **Vite**: For fast development and optimized builds.

This frontend is hosted on **AWS Amplify**, ensuring high availability and seamless scalability. Users interact with the application to:

- Upload `.txt` files.
- Monitor the conversion process.
- Access the generated audio files through a clean and responsive interface.

Once the audio file is ready, a **pre-signed URL** with an expiration time of **10 minutes** is sent back to the frontend. This allows users to securely:

- Play the audio file directly in the browser.
- Download the audio file for offline use.

The use of pre-signed URLs ensures secure and temporary access to the generated audio files, enhancing both usability and security.

---

## Backend

The backend of speakify is exposed via an **API Gateway endpoint**, which acts as the entry point for the frontend to communicate with the serverless architecture. The core logic is implemented in an **AWS Lambda function**, which handles the following tasks:

- Uploading text files to the **S3 input bucket**.
- Invoking **Amazon Polly** for text-to-speech conversion.
- Storing the resulting audio files in the **S3 output bucket**.
- Generating a **pre-signed URL** for secure access to the audio file.

Notifications are sent to users via **SNS** upon successful conversion, keeping them informed about the status of their requests.

---

## Backend Deployment

The backend infrastructure is deployed using **AWS SAM (Serverless Application Model)**, ensuring a consistent and efficient deployment process. Automation is handled through **GitHub Actions**, which integrates seamlessly with your source code repository to trigger deployments whenever changes are pushed.

### **Deployment Workflow**

1. **Code Commit**:

   - Developers push changes to the GitHub repository, triggering the deployment pipeline.

2. **GitHub Actions Pipeline**:

   - A GitHub Actions workflow is configured to automate the build and deployment process. The pipeline includes the following steps:
     - **Checkout Code**: Fetches the latest code from the repository.
     - **Install Dependencies**: Installs necessary dependencies for the Lambda function.
     - **Run Tests**: Executes unit tests and integration tests to ensure code quality.
     - **SAM Build**: Compiles the serverless application using the `sam build` command. This step packages the Lambda function code and dependencies into a deployable format.
     - **SAM Deploy**: Deploys the application to AWS using the `sam deploy` command. This step updates the CloudFormation stack with the latest changes.

3. **SAM Build**:

   - The `sam build` command compiles the application and prepares it for deployment. It ensures that all resources defined in the CloudFormation template are validated and ready for deployment.

4. **SAM Deploy**:

   - The `sam deploy` command deploys the application to AWS by updating the CloudFormation stack. This step creates or updates the following resources:
     - S3 buckets for input and output files.
     - Lambda function for text-to-speech processing.
     - API Gateway endpoint for file uploads.
     - SNS topic for notifications.

5. **Post-Deployment Validation**:
   - After deployment, automated scripts or manual checks can be performed to validate the functionality of the application. This includes testing file uploads, audio generation, and notification delivery.

### **Benefits of the Deployment Process**

- **Automation**: The use of GitHub Actions ensures that deployments are automated, reducing manual errors and saving time.
- **Consistency**: The `sam build` and `sam deploy` commands ensure that the deployment process is consistent and repeatable.
- **Scalability**: The serverless architecture allows the application to scale automatically based on demand, without requiring manual intervention.
- **Version Control**: All changes are tracked in the GitHub repository, providing a clear history of updates and facilitating collaboration.

---

## Key Features

- **Serverless Architecture**: Fully leverages AWS services for scalability and cost-effectiveness.
- **Secure Access**: Pre-signed URLs provide temporary and secure access to audio files.
- **Automated Workflow**: From file upload to audio generation and notification, the entire process is automated.
- **Responsive UI**: A modern, user-friendly frontend powered by React and TailwindCSS.
- **Scalable Hosting**: Frontend hosted on AWS Amplify for high availability and performance.

This architecture combines a user-friendly frontend with a robust, scalable backend, enabling seamless text-to-speech conversion while maintaining a serverless, cost-effective, and highly automated deployment process.

## Architecture Diagram

Below is the architecture diagram for the speakify application:

![speakify Architecture Diagram](https://github.com/Chrisyhjiang/speakify/blob/master/TTS_AWS.PNG)
