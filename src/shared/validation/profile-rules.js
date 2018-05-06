export const profileRules = {
  username: {
    minLength: 3,
    pattern: /^[aA-zZ][aA-zZ0-9]+$/
  },
  password: {
    minLength: 8
  },
  bio: {
    maxLength: 160
  },
  website: {
    pattern: /^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]*$/
  }
};
