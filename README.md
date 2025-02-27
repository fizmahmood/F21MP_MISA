F21MP MISA is a project for the development of a Multicultural Inheritance Sharing Application. 
The development of this project is carried out using React and React Native for development of the frontend, and python for the development of the backend. 

The frontend 
This is the UI of the application, when the user opens the application for the first time a UUID is generated and stored in a MYSQL database, the table in the database generates a user id
and a timestamp of the when the user is created. This user info will also be stored in the local storage of the browser and the application for the mobile application which will be developed.
This will ensure persistency for the user. User then fills in the details of beneficiaries and their count and networth, and stores it in the database. After which the user will be redirected
to the inheritance selection
framework, however in this development stage, just one inheritance framework has been developed and used for the development of the increments of the application, other inheritance frameworks
will be added after successfull integration of the frontend, database and backend. 
The frontend uses HTTP using axios to make HTTP requests to the backend. The frontend sends requests to the backend, receives responses, and updates the UI accordingly.
This setup allows the frontend and backend to communicate effectively, enabling the application to fetch and display data dynamically.

The backend
This is implemented using FASTAPI, which handles the API requests, database interactions and execution of inheritance scripts which execute the inheritance sharing logic for inheritance sharing
rules and customs. 
The backend sets up the the configuration of the FASTAPI, the connection of the database (which is currently hosted on the localhost for development purposes). There are fucntions that retrieve
fetches the inheritance scripts fron the database, and fuctions that executes the inheritance script from the backend and returns the results, which is stored in the database and
sent to the frontend.
