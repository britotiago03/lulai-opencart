module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn'
    },
    overrides: [
        {
            files: ['src/lib/db/**/*.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off'
            }
        }
    ]
};