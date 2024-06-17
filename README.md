# Fake Review Detection-NLP
In today's digital age, online product reviews play a crucial role in influencing purchasing decisions. With numerous options available for the same product, customers rely on reviews to make informed decisions. As a result, online services must ensure the authenticity of reviews to maintain their reputation. my Fake Review Detection System is designed to identify suspicious reviews, making it impractical for manual checks.

## System Overview

Our system employs a multi-faceted approach to detect fake reviews, comprising six checks:

1.Dual-view reviews

2.Reviews from the same user promoting or demoting a brand

3.Reviews from the same IP address promoting or demoting a brand

4.Flooded reviews from the same user

5.Similar reviews posted in the same time frame

6.Reviews with minimal text using Latent Semantic Analysis (LSA)

## Installation 

1.Python 3 or above for the machine learning model

2.Jupyter Notebook for the machine learning model

3.Visual Studio Code for improved code readability for the full-stack product review app

4.Node.js and MongoDB for the full-stack application

## Running the ML Model Locally

    
      pip install  nltk, pickle, re, Pandas , random


- run jupyter notebook in cmd.

Now, the ML model is ready to run.

## Running the Full-Stack Site

1. Install [mongodb](https://www.mongodb.com/)
2. Create a cloudinary account to get an API key and secret code

```
git clone 
cd Wander-World
npm install
```

Create a .env file (or just export manually in the terminal) in the root of the project and add the following:  

```
DATABASEURL='<url>'
API_KEY=''<key>
API_SECRET='<secret>'
```

Run ```mongod``` in another terminal and ```node app.js``` in the terminal with the project.  

Then go to [localhost:3000](http://localhost:3000/).
  
The project is running now.


## Tech Stack

**Programming languages**: Python, Node.js

**Front-end technologies**: HTML, CSS, EJS

**Libraries**: NLTK, Pickle, RE, Pandas
