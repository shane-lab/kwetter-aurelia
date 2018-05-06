# ![Kwetter Aurelia](/assets/logo.png)

> ### Your #1 socialmedia platform.


## Setup

Install [Node](https://nodejs.org/) or [Yarn](https://yarnpkg.com/). 
```sh
npm install # or | yarn install
```

After the dependencies have been installed, you may enter the following npm script to run the Aurelia application in `developer` mode:

```sh
npm run serve | # or yarn run serve
```

> If running Aurelia CLI locally does not work, you may have to install the Aurelia CLI globally:
> ```sh
> npm install -g aurelia-cli # or | yarn install -g aurelia-cli
>```

Once the application is up and running, navigate to `http://localhost:9000/`. 

### Building the project
Run `au build` to build the project. The build artifacts will be stored in the `scripts/` directory. Use the `--env prod` flag for a production build.

### Testing the project
Run `au test` to test the project.

## Functionality overview

**services**

- Authenticate users via JWT
- CRU* users (sign up & settings page - no deletion)
- CR*D Kweets (editor page - no updating)
- GET and display paginated lists of Kweets
- GET paginated list of followers
- GET paginated list of following
- GET paginated list of favorited Kweets
- Favorite a Kweet
- Follow other users

**routes:**

- *Home page* (URL: `/` | `/home` )
    - List of trending hashtags of the week
    - Paginated list of Kweets pulled from either Feed (requires authentication), Global, or by selected hashtag
- *Sign in/Sign up pages* (URL: `/login`, `/register` )
    - Uses JWT (store the token in localStorage)
- *Settings page* (URL: `/settings` )
- *Editor page* (URL: `/editor` )
- *Profile page* (URL: `/@/:username` )
    - Show basic user info
    - Paginated timeline from author's created Kweets and author's favorited Kweets
    - Button to (un)follow a users (requires authentication)
    - *Profile child pages*
        - `/@/:username/favorites`: Paginated list of all favorited Kweets
        - `/@/:username/followers`: Paginated list of all followed users
        - `/@/:username/following`: Paginated list of all following users
