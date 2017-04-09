![example](http://share.ahrengot.com/ANpKqRrvN8.png)

## Tech
React, Firebase.

## Get started
First, create `src/firebase-keys.js` and fill out your firebase config. It should look like this:

```JavaScript
export default {
  apiKey: "...",
  authDomain: "app-name.firebaseapp.com",
  databaseURL: "https://app-name.firebaseio.com",
  projectId: "app-name",
  storageBucket: "app-name.appspot.com",
  messagingSenderId: "..."
}
```

Note that this app expects read access for users without auth. Write access requires auth though.

Then, open your terminal and run `yarn install && npm run dev`

![](http://www.reactiongifs.com/r/ahwg.gif)
