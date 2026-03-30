/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Bật chế độ ban đêm cho đỡ mỏi mắt nè
  theme: {
    extend: {
      colors: {
        // Bộ màu kẹo ngọt pastel dành riêng cho TS 🍬
        candy: {
          pink: '#ffb3ba',   // Hồng phấn cute
          blue: '#bae1ff',   // Xanh mây trời
          green: '#baffc9',  // Xanh bạc hà mát lạnh
          yellow: '#ffffba', // Vàng chanh tươi tắn
          purple: '#f4c2c2'  // Tím mộng mơ
        },
      }
    },
  },
  plugins: [],
};