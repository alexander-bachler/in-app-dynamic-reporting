# in-app-dynamic-reporting 



## Getting started

To make it easy for you all set up sets will be described here.


## About this project

This project is part of the LineMetrics Frontend Services.
Its main purpose is to provide a dynamic reporting tool for the LineMetrics platform and therefore generating more data to visualize and analyze.


### Project structure

This project is a monorepo managed with npm workspace.
Therefore in the root directory, you will find the `package.json` file which contains the configuration for the workspace.

TODO: Add more information about the project structure

Consider npm install if they are need in every subproject or just in one subproject.
How to install a dependency for all subprojects.
```bash
npm install --workspaces {{package-name}}
```

#### Benefits of a monorepo
- Easier code sharing
- Easier dependency management
- Easier to maintain

The project is structured in the following way:
 - `apps/` contains the source code of the different applications

### Build and run the project

To build and run the project you need to have `node` and `npm` installed on your machine or Docker.

#### Build and run locally

To build and run the project locally you need to have `node` and `npm` installed on your machine.

```bash
npm install
npm run start --workspace={{report-name from package.json}}
```

Example for specific report:
```bash
npm run start --workspace=example-reporting
```

#### Build and run with Docker

To build and run the project with Docker you need to have Docker installed on your machine.

```bash
docker-compose up --build
```

The reports will be available at `http://localhost:1000/{{folder}}/{{report-name}}/index.html`



## Add a new report for a specific account

To add a new report for a specific account you need to follow these steps:

1. Create new feature branch from `main` branch after you have cloned the repository and pulled all changes with `git pull`
2. Create a new folder in the `apps/accounts` directory with the accountId
3. Create a new folder in the created folder with the name of the report
4. Copy the `example-reporting` folder and rename it to the name of the report
5. Update the `package.json` file
   - Update the `name` field with the name of the report
   - Update the `scripts:build` field to the right path to the `./build/` folder in the root directory
6. Copy the `.env.example` file and renaming it to `.env` and update the values to access the right account you are developing for
7. Start the subproject
    ```bash
    npm run start --workspace={{report-name from package.json}}
    ```
   
8. Finish testing and development by starting the project with Docker and check if your changes are working
    ```bash
    docker-compose up --build
    ```
   