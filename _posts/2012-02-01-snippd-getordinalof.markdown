---
layout: post
title: "// Snipp'd: getOrdinalOf"
date: 2012-02-01 01:24
categories:
- ActionScript 2
- ActionScript 3
- code
- snippet
- numbers
excerpt: "Gettin' goofy with ActionScript and in-line conditionals."
---

Yesterday, I had to write a function to take a number and get an ordinal number from it (turn "14" into "14th", for example). It got me messing with the way ActionScript parses in-line conditionals. Then, things just got goofy.

```actionscript
/**
 * Get the ordinal string ("st", "nd", "rd" or "th") of a given number.
 * @param   value the number whose ordinal string is to be returned
 * @return  The ordinal string of value.
 */
public static function getOrdinalOf(value:Number):String
{
    var n1:Number = Math.abs(Math.floor(value));
    var n2:Number = n1 % 10;
    return (n1 % 100 < 21 && n1 % 100 > 4) ? "th" : (n2 < 4) ? (n2 < 3) ? (n2 < 2) ? (n2 < 1) ? "th" : "st" : "nd" : "rd" : "th";
}
```

_I wrote this in ActionScript 2. It should work in ActionScript 3 unmodified, but you can eliminate the calls to the `Math` library if you change the type of `value` from a `Number` to a `uint`. If you might have negative numbers, you can use an `int` and keep the `Math.abs()` call._

