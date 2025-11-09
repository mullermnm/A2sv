 E-commerce Platform 
(Backend) 





Welcome to the A2SV Technical Interview
Hello Candidate, and welcome.
This technical interview is designed to evaluate how you approach real-world engineering challenges. We’re not only interested in what you know, but in how you build, how you structure your code, reason through problems, and make implementation decisions.
We’re looking for engineers who write clean, scalable, and well-documented code that reflects best practices and attention to detail.
Show us your best work. Communicate your thought process, explain your trade-offs, and deliver code you’d confidently deploy in a real environment.
Good luck. We are excited to see what you can build.


Objective

Read the user stories carefully and implement the backend with the framework of your choice. Once you have finished working, push to your public repository and submit the link to the Google form.

Duration
Deadline: The candidate is expected to submit the project latest by Wednesday, November 12, 2025, by 12:00 PM CAT(UTC+2)   
No submissions or commits should be made after the timer ends. Pushing changes after the timer ends will result in disqualification.


Before starting, remember to use the best backend practices.

Project

This project involves building a comprehensive REST API for an e-commerce platform. The platform will allow users to manage their product collections, place orders, and handle authentication. You will work on the core backend functionalities by reading the provided project requirements and technical specifications.

Language Requirement
Implement this project using the language of the position you applied for:
Go (Golang) for Backend (Go) applicants


Node.js / TypeScript for Backend (Node.js) applicants


Submissions written in a different language or framework will not be evaluated.

Tables
User
Id: UUID, primary key
Username: string
Email: string
Password: string
Product
Id: UUID, primary key
Name: string
Description: string
Price: number
Stock: number
Category:  
UserID: UUID (foreign key)

Order
Id: UUID, primary key
UserId: UUID (foreign key)
Description: string
TotalPrice: number
Status: string	
products: 
Response objects
Base response:
Success: boolean
Message: string
Object: object
Errors: list of strings, can be null
Paginated Response:
Success: boolean
Message: string
Object: list of objects
PageNumber: number
PageSize: number
TotalSize: number
Errors: list of strings
User Stories
User Story 1
Title:
Signup

Story:
As a new visitor to the e-commerce website, I want to sign up for an account so that I can place orders and view my order history.

Acceptance Criteria:
To sign up, the user must provide the following information via the POST /auth/register endpoint:
Username: Plaintext, required, must be unique.
Email: Plaintext, required, must be unique.
Password: Plaintext during submission, but must be stored as a hashed value (using bcrypt).
Input Validation Rules:
Email:
Must be a valid email address format (e.g., user@example.com).
The system must check that the email is not already registered.
Username:
Must be alphanumeric (letters and numbers only, no special characters or spaces).
The system must check that the username is not already taken.
Password:
Must be at least 8 characters long.
Must include at least one uppercase letter (A-Z).
Must include at least one lowercase letter (a-z).
Must include at least one number (0-9).
Must include at least one special character (e.g., !@#$%^&*).
API Response:
Upon successful registration, the API should return a 201 Created status code and a success message.
If any validation rule fails (e.g., email already exists, password is too weak), the API should return a 400 Bad Request status code with a clear error message explaining the issue.
Sensitive information, like the password, must never be returned in the API response.
User Story 2
Title:
Login
Story:
As a registered user of the e-commerce website, I want to log in to my account so I can access protected features like placing an order and viewing my profile.

Acceptance Criteria:
To log in, the user must provide the following credentials via the POST /auth/login endpoint:
Email: The email address they used to register.
Password: Their account password.
Authentication Process:
The system must find the user in the database by their email address.
The submitted password must be compared and validated against the stored hashed password.
API Response and Error Handling:
If the user does not exist or if the password is incorrect, the API must return an appropriate error status code (e.g., 401 Unauthorized) with a clear error message like "Invalid credentials."
If the input is invalid (e.g., email is not in the correct format), the API should return a 400 Bad Request status code with a specific validation error message.
Successful Login:
Upon successful authentication, the system must generate a JWT (JSON Web Token) for the user.
The JWT payload should contain essential, non-sensitive user information (e.g., userId, username, and role).
The API should return a 200 OK status code along with the generated JWT, which the client will use for authenticating subsequent requests.
User Story 3
Title: 
Create Product

Story:
As an Admin of the e-commerce website, I want to add a new product to the catalog so that it becomes available for customers to purchase.

Acceptance Criteria:
To add a new product, the Admin must send a POST request to the /products endpoint with the following data:
name: Plaintext, required.
description: Plaintext, required.
price: A numeric value, required.
stock: An integer representing the available quantity, required.
category:
Authorization:
This endpoint must be protected and accessible only by authenticated users with an 'Admin' role.
If a non-admin user or an unauthenticated user attempts to access it, the API should return a 403 Forbidden or 401 Unauthorized status code.
Input Validation Rules:
name: Must be a non-empty string (e.g., between 3 and 100 characters).
description: Must be a non-empty string (e.g., at least 10 characters long).
price: Must be a positive number greater than 0.
stock: Must be a non-negative integer (0 or more).
category: 
API Response:
Upon successfully creating the product, the API should return a 201 Created status code and the data of the newly created product.
If any validation rule fails, the API should return a 400 Bad Request status code with a clear error message indicating which field is invalid.
User Story 4
Title: 
Update an Existing Product

Story:
As an Admin of the e-commerce website, I want to update the details of an existing product so that I can correct its information, change the price, or manage stock levels.

Acceptance Criteria:
To update a product, the Admin must send a PUT request to the /products/:id endpoint, where :id is the ID of the product to be updated. The request body can contain any of the following fields:
name: Plaintext.
description: Plaintext.
price: A numeric value.
stock: An integer.
category:
Authorization:
This endpoint must be protected and accessible only by authenticated users with an 'Admin' role.
If a non-admin user or an unauthenticated user attempts to access it, the API should return a 403 Forbidden or 401 Unauthorized status code.
Input Validation Rules:
Any field provided in the request body must meet the same validation criteria as in the product creation story:
name: Must be a non-empty string.
description: Must be a non-empty string.
price: Must be a positive number.
stock: Must be a non-negative integer.
API Response:
If the product with the specified :id does not exist, the API should return a 404 Not Found status code.
If any validation rule for the submitted data fails, the API should return a 400 Bad Request status code with a clear error message.
Upon successfully updating the product, the API should return a 200 OK status code and the data of the updated product.
User story 5
Title:  Get a List of Products


Story:
As a visitor or customer of the e-commerce website, I want to see a list of all available products so that I can browse the catalog.

Acceptance criteria:
A GET request to the /products endpoint should retrieve a list of all products.
This endpoint must be public and accessible without authentication.
The request should support pagination using query parameters:
page: The page number to retrieve. A number, defaults to 1.
limit or pageSize: The number of products to display per page. A number, defaults to 10.
The JSON response from the API must be in a paginated format and include:
currentPage: The current page number being displayed.
pageSize: The number of items on the current page.
totalPages: The total number of pages available based on the page size.
totalProducts: The total count of all products in the database.
products: An array of the product objects for the current page.
Each product object in the products array should contain essential information like id, name, price, stock, and category.
User story 6
Title:
Search for Products


Story:
As a user of the e-commerce website, I want to be able to search for products by their name so I can find what I'm looking for quickly.


Acceptance criteria:

The GET /products endpoint should accept a query parameter for searching, for example, ?search=productName.
The search query parameter:
Can be an empty string or not provided. If so, the endpoint should return a list of all products (as in User Story 5).
If it is not empty, the API must perform a case-insensitive, partial-match (substring) search against the product name.
The endpoint should remain public and accessible to all users without authentication.
The response must be paginated, consistent with the "Get a List of Products" story, and include:
currentPage
pageSize
totalPages
totalProducts (reflecting the total count of the search results, not all products)
products: An array of the product objects that match the search criteria for the current page.
User story 7
Title:
Get Product Details
Story:
As a user, I want to be able to see the detailed information of a selected product, such as its full description, price, and stock availability, so I can decide if I want to purchase it.


Acceptance criteria:
A GET request to the /products/:id endpoint (where :id is the product's unique identifier) should retrieve the details for that specific product.
This endpoint must be public and accessible to all users without authentication.
The request must include the id of the product in the URL path.
API Response (Success):
If a product with the specified id is found, the API should return a 200 OK status code.
The response body should be the complete product object, containing all its details (e.g., id, name, description, price, stock, category).
API Response (Failure):
If no product is found with the given id, the API must return a 404 Not Found status code with a clear error message (e.g., "Product not found").
User story 8
Title:
Delete a Product
Story:
As an Admin of the e-commerce website, I want to permanently delete a product from the catalog so that it is no longer visible or available for purchase.


Acceptance criteria:

To delete a product, the Admin must send a DELETE request to the /products/:id endpoint, where :id is the product's unique identifier.
Authorization:
This endpoint must be protected and accessible only by authenticated users with an 'Admin' role.
If a regular user or unauthenticated user attempts to perform this action, the API must return a 403 Forbidden or 401 Unauthorized status code.
API Response (Success):
Upon successful deletion of the product, the API should return a 200 OK status code with a confirmation message (e.g., "Product deleted successfully").
API Response (Failure):
If no product is found with the specified id, the API must return a 404 Not Found status code with an appropriate error message.

User story 9
Title:
Place a New Order

Story:
As a logged-in user, I want to place an order for one or more products so that I can purchase the items I have selected.


Acceptance criteria:

To place an order, the user must send a POST request to the /orders endpoint with an array of products, specifying the productId and quantity for each.
Example Request Body: [{ "productId": "uuid-for-product-a", "quantity": 2 }, { "productId": "uuid-for-product-b", "quantity": 1 }]
Authorization:
This endpoint must be protected and accessible only to authenticated users with a standard 'User' role.
The API must use the userId from the authenticated JWT to associate the order with the user.
Business Logic & Validation:
For each item in the order, the system must verify if there is sufficient stock.
The entire order placement process (checking stock, updating stock, creating the order) must be handled within a database transaction. If any part fails (e.g., one item is out of stock), the entire transaction must be rolled back, and no changes should be saved to the database.
The total_price of the order must be calculated on the backend by fetching the prices from the database, not trusted from a client request.
API Response (Success):
Upon successfully placing the order, the API should return a 201 Created status code.
The response body should contain the details of the newly created order, including the order_id, status (e.g., "pending"), total_price, and the list of products ordered.
API Response (Failure):
If any product in the order has insufficient stock, the API must return a 400 Bad Request status code with a clear error message (e.g., "Insufficient stock for Product X").
If any productId provided does not exist, the API should return a 404 Not Found status code.

User story 10
Title:
View My Order History
Story:

As a logged-in user, I want to view a list of all the orders I have previously placed so I can track their status and review my purchase history.

Acceptance criteria:

A GET request to the /orders endpoint should retrieve a list of orders.
Authorization:
This endpoint must be protected and accessible only to authenticated users.
The API must filter the results to show only the orders belonging to the authenticated user (identified by the userId in the JWT). A user must never be able to see another user's orders.
API Response (Success):
The API should return a 200 OK status code with an array of the user's order objects.
Each order object in the array should contain key summary information like order_id, status, total_price, and created_at.
If the user has not placed any orders, the API should return a 200 OK status code with an empty array.
API Response (Failure):
If an unauthenticated user tries to access this endpoint, the API should return a 401 Unauthorized status code.
Bonus
Write unit tests for all the HTTP requests by mocking the database.
Implement caching for the product listing endpoint.
API Documentation
Product Image Uploads
Advanced Search and Filtering
Security Enhancement: Rate Limiting
Submission Guidelines
Repository: Create a new public GitHub repository for your project.
Commits: Commit your code frequently with clear, descriptive messages (e.g., “feat(backend): implement user login endpoint”).
README: Include a README.md file that explains:
How to set up and run your project locally.
Any environment variables needed (e.g., DATABASE_URL, JWT_SECRET, CLOUDINARY_API_KEY).
A brief explanation of your technology choices.
Final Push: Ensure all your code, including the README, is pushed to GitHub before the 2-hour time limit expires.
Submission: Submit the link to your public GitHub repository via the provided Google Form.   LInk


Good luck! 👋
