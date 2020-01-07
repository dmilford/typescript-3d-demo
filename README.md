# Setup
	- Make sure you have c++ and python installed via visual studio
		- Go onto Visual Studio 2017 or 2019.
		- Select Tools/Get Tools and Features...
		- Make sure "Desktop Development with C++" is checked.
		- Maky sure "Python Development" is checked.
		- If you made any changes, click "Modify" in the bottom right hand corner of your screen.
		- If you made any changes, you probably need to delete your node_modules folder and do a fresh "npm install"
	- Type npm install
	- To run, type npm run dev
	- There are other scripts that you can run in package.json
	- Add VS Code extension "Debugger for Chrome"
	- Add VS Code extension "C/C++"
	- You may need to restart VS Code... maybe.

# Linting
    https://eslint.org/docs/rules/

    - Make sure you install extension "ESLint" in VS Code
	- Press f1... in the search box, type "Preferences: Open Settings (JSON)"
	- Add the following to the file
		"eslint.validate": [
			"javascript",
			"javascriptreact",
			"typescript",
			"typescriptreact"
		]

# Debugging
	- Create a debug environment
		- Click the "bug" symbol on the very left hand panel of VS Code (looks like a lock with spikes coming out of it and an "x" in the middle)
		- Click the dropdown that says "No Configuration"... select "Add Configuration..."
		- Select "Chrome" option
		- You should see a folder called ".vscode" at the very top of your file list.  Open that up, and open the launch.json file.
		- Use the following setting inside launch.json
			"version": "0.2.0",
			"configurations": [
				{
					"name": "Attach to url",
					"type": "chrome",
					"request": "attach",
					"port": 9222,
					"url": "http://localhost:8080/",
					"webRoot": "${workspaceFolder}"
				}
			]
		- VS Code settings (bottom right hand corner of the screen... gear icon... select settings)
			- Search for "breakpoint"
			- Make sure "Debug: Allow Breakpoints Everywhere" is checked
		- Close all chrome browsers
		- Prep Chrome to be able to attach to the VS Code debugger
			- Right click on the Chrome icon that starts chrome
			- You will see a Google Chrome icon in the right click menu... right click that
			- You will see a Properties item in that right click menu.  Select that.
			- Paste the following in the "Target" field on the "Shortcut" tab (include the quotes in the paste)
				"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
			- Click ok
		- Open up Chrome manually.  This will apply the remote debugging settings we did in the previous step.  Your browser is now ready to attach 
		  the debugger.
		- When you run the program with "npm run dev", you can attach this debugger
			- Click on the "bug" symbol on the very left hand side of VS Code (looks like a lock with spikes coming out of it and an "x" in the middle)
			- You should see and "Attach to url" option... run it.
			- Now you can put breakpoints in your code and hit them at runtime

