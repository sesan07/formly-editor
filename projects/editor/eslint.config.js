// @ts-check

// Allows us to use the typed utility for our config
const tseslint = require('typescript-eslint');

// Require our workspace root level config and extend from it
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
    // Apply the root config first
    ...rootConfig,
    {
        // Any project level overrides or additional rules for TypeScript files can go here
        // (we don't need to extend from any typescript-eslint or angular-eslint configs because
        // we already applied the rootConfig above which has them)
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'editor', // different to our root config, which was "app"
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'editor', // different to our root config, which was "app"
                    style: 'kebab-case',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'enumMember',
                    format: ['UPPER_CASE'],
                },
                {
                    selector: 'memberLike',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
            ],
            'no-shadow': 'off',
            'no-underscore-dangle': 'off',
        },
    },
    {
        // Any project level overrides or additional rules for HTML files can go here
        // (we don't need to extend from any angular-eslint configs because
        // we already applied the rootConfig above which has them)
        files: ['**/*.html'],
        rules: {},
    }
);
