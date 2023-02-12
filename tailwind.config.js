var breakpoints = ['sm', 'md', 'lg', 'xl'];
/** @type {import('tailwindcss').Config} */
module.exports = {
    safelist: [
        'grid',
        'flex',
        {
            // pattern: /bg-(red|green|blue)-(100|200|300)/,
            pattern: /col-(start|span)-\d+/,
            variants: breakpoints, // you can add your variants here
        },
        {
            pattern: /row-(start|span)-\d+/,
            variants: breakpoints,
        },
        {
            pattern: /grid-(cols|rows)-\d+/,
            variants: breakpoints,
        },
        {
            pattern: /gap-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /w-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /h-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /m-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /mx-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /my-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /mt-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /mr-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /mb-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /ml-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /p-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /px-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /py-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /pt-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /pr-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /pb-\S+/,
            variants: breakpoints,
        },
        {
            pattern: /pl-\S+/,
            variants: breakpoints,
        },
    ],
    content: [],
    theme: {
        screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
        },
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false, // Disable preflight to avoid unexpected styling differences
    },
};
