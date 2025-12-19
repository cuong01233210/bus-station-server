# bus-station-server

Starting from scratch Step 1: Install TypeScript npm install -g typescript Step 2: Initialize the tsconfig file tsc --init

In the tsconfig file, edit:

target to ts6 or ts2016
uncomment "ourDir" : "./dist"
uncomment "rootDir": "./src"
uncomment "moduleResolution" : "node"

Add "include": ["src/**/*.ts"], "exclude": ["node_modules"] to deploy
Step 3: Initialize the package.json file npm init -y

Step 4: Install Express npm install express

Step 5: Install other libraries npm install --save-dev @types/express @types/node ts-node typescript

Step 6: Install Node.mon if you're too lazy to compile the code to JS npm install nodemon

Step 7: In the package.json file Edit the script:

If running with Node.js: `"dev": "nodemon ./src/app.ts"` The command to run will be `npm run dev`.

If compiling to JS, use two scripts:

"start": "node dist/app.js",

"build": "tsc"
Then run the command `npm run build` to build and `npm start` to run the command.

Note: When deploying, Railway only reads the code built in the ".dist" file, so you need to rebuild it before updating Git.

Note:

If you have trouble installing a library, remember to spam `sudo`. When adding a new library, use the formula `npm install + library name` or get the command from gpt.

To quickly install all libraries when you have the `tsconfig` and `package.json` files but not the `node_modules` file, use `npm install`.

If you see a sample project later, remember to include the libraries in `gitignore`.




