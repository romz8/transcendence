import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
	{
		languageOptions: {
			ecmaVersion: 2021, // ECMAScript 2021
			sourceType: 'module', // Enables ES Modules
			globals: {
				...globals.browser, // Browser global variables
				...globals.node, // Node.js global variables
			},
		},
		// Extending recommended configurations
		...pluginJs.configs.recommended,
		rules: {
			// Example rules, you can customize these as needed
			'no-unused-vars': 'warn', // Warns about unused variables
			'no-console': 'off', // Allows console statements
			'quotes': ['error', 'single'], // Enforce single quotes
			'semi': ['error', 'always'], // Enforce semicolons
			'indent': ['error', 'tab', { 'SwitchCase': 1, 'VariableDeclarator': 1, 'MemberExpression': 1 }],
		},
	},
];
