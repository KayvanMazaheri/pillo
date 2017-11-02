<h1 align="center">
	<img height="200" src="https://github.com/KayvanMazaheri/pillo/raw/master/public/assets/image/pillo-logo.png" alt="Pillo Logo">
  <br>
  :pill: Pillo :pill:
	<br>
</h1>

---
# Pillo
Simple medication reminder for an oblivious friend.  
Visit [Pillo.ir](http://pillo.ir).

## Badges
[![Travis](https://img.shields.io/travis/KayvanMazaheri/pillo.svg?maxAge=600&style=flat-square)](https://travis-ci.org/KayvanMazaheri/pillo)  
[![Codacy grade](https://img.shields.io/codacy/grade/43a1001df5eb4c1a899029d8832e56f6.svg?maxAge=3600&style=flat-square)]()  
[![David](https://img.shields.io/david/KayvanMazaheri/pillo.svg?style=flat-square)](https://david-dm.org/KayvanMazaheri/pillo)  
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)  
[![license](https://img.shields.io/github/license/KayvanMazaheri/pillo.svg?style=flat-square)](https://github.com/KayvanMazaheri/pillo/blob/master/LICENSE)  

# How to run it
Clone the repository
```bash
git clone https://github.com/KayvanMazaheri/pillo.git && cd pillo
```
Install dependencies
```bash
npm install
```
Start the server
```bash
npm start
```

**NOTE**:  
The following environment variables must be set before running `npm start`.  
They can be declared inside a file named `.env` (see [dotenv](https://github.com/motdotla/dotenv#usage) for more information).  
+ GOOGLE_ID
+ GOOGLE_SECRET
+ REDIS_URL
+ MONGODB
+ TELEGRAM_BOT_TOKEN
+ POSTMARK_API_TOKEN
+ SESSION_SECRET
+ KUE_WEB_USER
+ KUE_WEB_PASSWORD
+ ONESIGNAL_API_KEY
+ ONESIGNAL_APP_ID

# Contribution Guide
Any contribution is appreciated.
## Submit an issue

## Modify the code
1. Fork the repo.
2. Make your changes.
3. Make sure `npm test` passes.
4. Create a Pull Rrequest.

# Donate
Support Pillo by making a donation here:  
[![Donate](https://img.shields.io/badge/$-Donation-green.svg?style=flat-square)](http://pillo.ir/about#donate)

# Special Thanks
+ Awesome cross-browser testing tool  
<a href="https://www.browserstack.com" target="_blank"><img width="200" src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" atl="BroswerStack"></a>
+ 
<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/uq4aZbNyxxQtDK42XaJfnorV/KayvanMazaheri/pillo'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/uq4aZbNyxxQtDK42XaJfnorV/KayvanMazaheri/pillo.svg' />
</a>

# License
The MIT License (MIT)
