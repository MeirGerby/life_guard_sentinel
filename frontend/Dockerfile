# שלב 1: בנייה
FROM node:18-alpine as build

WORKDIR /app

# הגדרת משתנה סביבה להגדלת הזיכרון של Node (חשוב בפרויקטים גדולים)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# העתקת קבצי הקונפיגורציה בלבד קודם (לניצול Cache)
COPY package*.json ./

# התקנה נקייה תוך התעלמות מבעיות תאימות של מערכת ההפעלה
RUN npm install --legacy-peer-deps

# העתקת שאר הקוד
COPY . .

# בנייה
RUN npm run build

# שלב 2: Nginx
FROM nginx:stable-alpine
# ב-React כברירת מחדל התיקייה היא build, ב-Vite היא dist. וודא מה אצלך:
COPY --from=build /app/build /usr/share/nginx/html

# הוספת קונפיגורציה בסיסית ל-Nginx כדי שתתמוך ב-React Router (מונע 404 בריפרש)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.js; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]