## Security application
Backend application.
<h3>Implemented features:</h3>
<ul>
    <li>OAuth 2.0 authorization with Google</li>
    <li>Protecting /secret endpoint from unauthorized users</li>
    <li>HTTPS with self signed sertificate</li>
</ul>

<h3>Used technologies:</h3>
<ul>
    <li>NodeJS, Express</li>
    <li>Helmet, Passport.js, cookie-session</li>
</ul>

<h3>Requirements</h3>

<b>TLC Self Signed certificate</b>. Install openssl on your machine.
Run this command in the terminal while being in project's folder:
<code>openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365</code>

<b>Google's credentials</b>. You need to create a web application on console.cloud.google.com and put ClientID and Client Secret into .env file in the root of the project.

<h3>Installation</h3>
Run in terminal: <code>npm install</code>
After intallation, run <code>npm start</code>
Server has been started. You can open it in your browser.
