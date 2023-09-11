// Plugins
const layout = [
    'display',
    'flexDirection',
    'gap',
    'gridColumn',
    'gridColumnEnd',
    'gridColumnStart',
    'gridRow',
    'gridRowEnd',
    'gridRowStart',
    'gridTemplateColumns',
    'gridTemplateRows',
];
const spacing = ['padding', 'margin'];
const sizing = ['width', 'height'];

/** @type {import('tailwindcss').Config} */
module.exports = {
    safelist: [
        {
            pattern: /./,
            variants: ['sm', 'md', 'lg', 'xl'],
        },
    ],
    theme: {
        screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
        },
    },
    corePlugins: [...layout, ...spacing, ...sizing],
};
