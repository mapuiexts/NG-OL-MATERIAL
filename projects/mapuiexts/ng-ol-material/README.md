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
npm install ol --save
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

# Development

## Code scaffolding

Run `ng generate component component-name --project ng-ol-material` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ng-ol-material`.
> Note: Don't forget to add `--project ng-ol-material` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ng-ol-material` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ng-ol-material`, go to the dist folder `cd dist/ng-ol-material` and run `npm publish`.

## Running unit tests

Run `ng test ng-ol-material` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
