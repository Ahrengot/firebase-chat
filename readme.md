![example](http://share.ahrengot.com/uesm0SHX2/Screen-Shot-2017-04-13-22-23-05.jpg)

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

Note that this app expects public read access for `/users`. Write access for all data requires auth.

Then, open your terminal and run `yarn install && npm run dev`

![](http://www.reactiongifs.com/r/ahwg.gif)
