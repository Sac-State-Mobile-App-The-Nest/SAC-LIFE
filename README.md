# SAC-LIFE Mobile Application 
  ![School Logo](SacStateApp/src/assets/Primary_Stacked_1_Color_Green_hires.png)

  ## Table of Contents

- [Synopsis](#Synopsis)
- [Testing](#Testing)
- [Deployment](#Deployment)


## Created by The Nest  
 #### Nicholas Lewis   
 #### Christian Buco   
 #### Randy Pham   
 #### Justin Rivera   
 #### Bryce Chao  
 #### Devin Grace  
 #### Vinny Thai  
 #### Darryl Nguyen  
 #### Aaron Jumawan  

## Synopsis  

### Our work has focused on creating a secure, personalized, and user-friendly application with the following accomplishments:
  - ***Fully Functional Backend:*** Students can now log in securely using JWT authentication, with hashed passwords stored in an Azure SQL database.
  - **Personalized Profiles:** Each student’s profile is tailored with unique tags based on their responses, enabling customized campus service recommendations.
  - **Enhanced UI:** We've revamped the app’s user interface for better usability and a modern, polished look.
  - **Personal Dashboard Updates:** The dashboard now includes a calendar feature that displays precise dates, helping students stay organized.
  - **AI Chatbot Integration:** We’re leveraging Google Dialogflow to provide a responsive chatbot for improved student support.

  On the backend, we’ve implemented a relational database using Azure SQL to manage student data, campus services, and informational tags. Admins can now add or remove users through the admin website, and we've designed a query system to recommend campus services to students based on their tags, creating a personalized experience. The database schema is optimized for scalability and efficiency, ensuring robust data management as the app grows.  
  
For authentication, we’ve implemented a system that uses username and password logins, with plans to integrate SSO via Shibboleth/SAML to meet Sac State’s authentication standards. The admin website supports distinct roles: Super User (managing admin users), Admins (managing general users), and a Support role (view-only access). These features ensure secure and role-based access control, aligning with our project’s goals for both user and administrative functionality.  

## Testing 
We employed a combination of manual testing, unit tests, and integration tests to ensure the functionality and reliability of the SAC-LIFE Mobile Application.

  1. Manual Testing
     - Performed across both the mobile app and admin website to identify usability and layout issues.
     - Verified key features such as:
         > User login and profile creation.
         > Dashboard navigation and AI chatbot responses.
         > Admin panel functionality for managing users and tags.
  
  2. Unit Testing (In Progress)
     - Focused on backend API routes and database queries.
     - Tools: Jest for JavaScript-based testing.
    
  3. Integration Testing
     - Verified interaction between the mobile app, backend API, and Azure SQL database.
     - Tools: Postman for API testing and Expo for mobile debugging.
    
  4. Automated Testing (In Progress)
     - Leveraging frameworks like Selenium for end-to-end testing.
  

  ### How to Run Tests  
  ---
  > **Backend API Testing**  
  ```cmd
  cd backend-api
  npm test
  ```
  > **Mobile App Testing**
  ```cmd
  cd SacStateApp
  npm start
  ```
   > **Admin Website Testing**
  ```cmd
  cd admin-web
  npm start
  ```
  

## Deployment
  The SAC-LIFE Mobile Application consists of three main components: the mobile app, the admin website, and the backend API. Each component is deployed separately to ensure scalability and modularity.
  
  1. **Mobile App**  
     - Deployed via Expo for development and testing.  
     - For production, the app will be built into native binaries (APK for Android and IPA for iOS) using Expo's build tools.  
     - Planned distribution through the Google Play Store and Apple App Store.  
  
  2. **Admin Website**  
     - Hosted using Docker containers for consistent environment replication.  
     - Deployed on Azure or netilify with HTTPS enabled for secure connections.  
  
  3. **Backend API**  
     - Hosted on Microsoft Azure as a Node.js application.  
     - Connected to an Azure SQL database for reliable and scalable data storage.  
     - Secured with environment variables for sensitive configuration (e.g., database credentials and JWT secrets).
     - HTTPS enabled for secure connections.
  
  ### Deployment Steps  
  ---
  #### Clone the Repository  
  1. Clone the project repository to your local machine:  
     ```bash
     git clone https://github.com/Sac-State-Mobile-App-The-Nest/SAC-LIFE.git
  
  2. Navigate to the project directory:  
     ```bash
     cd SAC-LIFE
  ---

  #### Mobile App 
  1. Navigate to the mobile-app folder:  
     ```bash
     cd SacStateApp

  2. Create a .env file with the following configuration:  
     ```env
     DEV_BACKEND_SERVER_IP=<your-IP-address>
     # Replace the IP address with your own
     # Make sure to also rename the env file from 'env' to '.env'
  
  3. Install dependencies:  
     ```bash
     npm install

  4. Start the development server:
     ```bash
     npm start

  5. For production, build the app binaries:
     ```bash
     expo build:android
     expo build:ios

  6. Upload the generated binaries to the respective app stores.

  ---
  #### Admin Website
  1. Navigate to the admin-web folder:  
     ```bash
     cd ../admin-web
  
  2. Install dependencies:  
     ```bash
     npm install

  3. Start the development server:
     ```bash
     npm start

  4. For now, access admin website locally

  ---
  #### Backend API
  1. Navigate to the backend-api fodler:  
     ```bash
     cd ../backend-api
  
  2. Create a .env file with the following configuration:  
     ```env
     DB_USER=<your-database-user>
     DB_PASSWORD=<your-database-password>
     DB_SERVER=<your-database-server>
     DB_DATABASE=<your-database-name>
     JWT_SECRET_TOKEN=<your-secret-token>
     JWT_REFRESH_TOKEN=<your-refresh-token>
     WT_SECRET_ADMIN=<your-adim-secret-token>
     # Make sure to also rename the env file from 'env' to '.env'

  3. Install dependencies:
     ```bash
     npm install

  4. Start the backend API server:
     ```bash
     npm start

  5. Verify API endpoints using Postman or a similar tool

  ---
  ### Chatbot API
  1. Navigate to the backend-api fodler:  
       ```bash
       cd ../chatbot-api

  2. Start the chatbot server using Google Dialog Flow  
       ```bash
      npm install @google-cloud/dialogflow
      npm start
  3. Test on the app UI
    

## Developer Instructions
Placeholder for now

## App Layout and flow
![ERD 1](SacStateApp/src/assets/saclife_erdp1.PNG)  

![ERD 2](SacStateApp/src/assets/saclife_erdp2.PNG)







      
  

