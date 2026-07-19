/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      screens: {
        'xs': '450px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      minWidth: {
        'screen': '450px',
      },
    },
  },
  // v4: preflight e cores agora estão configurados em src/tailwind.css via @theme
};
