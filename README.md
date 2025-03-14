# Movie Management Frontend

This Project is an online Movies Management website where you can watch Movies online. The only thing it's missing is its content (the movies itself). However, they can be added later by linking to media hosted on 3rd party services. This is the Frontend only; for Backend, see the [Movie-Management repository](https://github.com/MostafaMagdySe/Movie-Management).

## Project Setup

1-This project was Created using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.
2-Install node.js on your System

## Running the Project
1- clone the project to your local repository or just download the project to your pc and follow the next steps:

2-open cmd and mov to the project's directory i.e. cd movie-management-frontend

3- Install dependencies by running this command:
```bash
npm install
```

4- Run the project:
```bash
ng serve
```

**Note:** Remember that you need to follow instruction on the backend repo because you need backend to run the full project.. so you will need to running the backend server at http://localhost:8080 and making sure that Postgresql is Also running.

5- Now, you are ready to go! just hit http://localhost:4200 and you are ready to test the website.

## Getting Started to the Website

1- When you first open the website.. you need to create an account, so just hit register. this will lead you to a a page where you will see a form.. fill the form providing your details.. and now, after registering. you will be able to login immediately  

2- You are now in the main dashboard page of the website, you will see that there are no movies yet.. because you will have to add them to the website. However, you just registered as Normal user, and only Admin users can see the buttons for adding and Removing Movies. so next step is upgrading your role to admin.

3-Now, Head to Postgresql.. and go to Users table.. you will see your account over there.. and under role_id column.. you will find that yo have a value of "2" , change it to "1" .. by doing that.. you are now an Admin user and can Add/Remove Movies

4-Head Back to the Website http://localhost:4200 log out, and log in again.. you will see that you are now seeing add/remove Movies buttons.. we now want to add some movies.

5-Now, to add movies, yo can add them one by one or add up to 10 movies at once. to do that.. you need the full title of the movie you want to add.. if you don't know from where to get that, go to[IMDB](https://www.imdb.com/) and pick up a movie's full title.. and paste it in add movies on the website.. if you wanted to add more than one movie at once, write one movie's name in each line.

6-After that press Add Movies, and you will see that the Movies is now added.. you can press on any movie to see that movie's details

7- To remove a movie, you need to do the same steps, but use Remove Movies button and paste the full movie's name.. you have to write the name accurately to make it get deleted

## User Profile

in the Top-Right corner.. you will find a little profile icon.. press on it to see your account's profile.. and you can Also update your account's information

## Rating Movies

in each Movie, you have the Ability to rate that Movie 1-10 and to write a little comment.. but you are allowed to only put one rating.. and if you wanted to change it.. you will have to delete your old review and you will be able to write another review

## Search 
on the Main Dashboard Page, you can search for movies.. when you start typing and the searching will be started immediately 

## Forgot Password

1-if you aren't logged in and forogt your password, you will be ale to reset your pasword easily. just hit forgot password and you will be redirected to a page where you will be told to write your email that matches the email you have used in your registeration.

2-After that, a verifivation code will be sent to your email , copy that code and paste it in its corresponding field.. remember that you aren't allowed to request more than one code ever two minutes.


**Note:** This Front end was generated Using Ai tools, Of course Creating a Front-End Project and linking it to the Back-end requires some basic Knowledge but Ai Tools Proved that it can generate A whole Website by prompting Well-Structured Instructions and Being able to Track the Flow of both Backend and Front End using Browser's Dev Tools to correct Strange Behaviour of the Website to make sure that everything is Goin on as Intended!

3- after writing valid verification code, you will be redirected to a page where you will assign your new password
