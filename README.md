# @mapuiexts/ng-ol-material
Angular UI Component Library based on OpenLayers and Angular Material Design
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.0.

## Installation

### 1. Create an angular project
Create a new angular project named app-test (or any name you want) by running the following command:
```sh
ng new app-test
```

### 2. Install Angular Material
Add Angular Material to your application by running the following command:
```sh
ng add @angular/material
```

### 3. Install Openlayers
Add Openlayers to your application by running the following command:
```sh
npm install --save ol
```

### 4. Install proj4
If you need to work with projection(s) not provided by openlayers, you will need to install the proj4 library.
Add proj4 to your application by running the following command:
```sh
npm install --save proj4 @types/proj4
```


### 5. Install @mapuiexts/ng-ol-material library
Add @mapuiexts/ng-ol-material to your application by running the following command:
```sh
npm install @mapuiexts/ng-ol-material --save
```

### 6. Add required styles
Your application will need the material angular, openlayers and @mapuiexts/ng-ol-material styles.
The material angular style is added automaticaly during its installation in the angular.json file.
Add the remaining styles in your angular.json file:
```json
"styles": [
    "@angular/material/prebuilt-themes/azure-blue.css",
    "node_modules/ol/ol.css",
    "node_modules/@mapuiexts/ng-ol-material/assets/styles/ng-ol-material.css",
    "app-test/src/styles.css"
]
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding for app example

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build app example

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests for app example

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests for app example

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
