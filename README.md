# Wrap imports with region

A simple script that wraps all import statements in all files recursively with the JetBrains WebStorm IDE `//region`
block.

For example:

before:

```ts
import axios   from 'axios'
import express from 'express'
import path    from 'path'
```

after running the script:

```ts
//region imports
import axios   from 'axios'
import express from 'express'
import path    from 'path'
//endregion
```

collapsed, it will only show the word `imports`

## How to Run

`node wrap-imports-with-regions.js`

## Arguments

| arguments     | description                                  | default value                                                                                                        | usage examples                                                                            |
| ------------- |:--------------------------------------------:| --------------------------------------------------------------------------------------------------------------------:|------------------------------------------------------------------------------------------:|
| `noEmit`      | Disables logs                                |`false`                                                                                                               |`node wrap-imports-with-regions.js noEmit` <img width=300/>                                |
| `extension`   | File extension to run the script on.         |`.ts`                                                                                                                 |`node wrap-imports-with-regions.js extension=.js`                                          |
| `startFolder` | folder to start searching from               |`root folder`                                                                                                         |`node wrap-imports-with-regions.js startFolder=sub-dir`                                    |
| `regionText`  | what word is shown when region is collapse   |`imports`                                                                                                             |`node wrap-imports-with-regions.js regionText='CUSTOM TEXT'`                               |
| `excluded`    | ignores file that match the pattern provided |`node_modules, .idea, polyfills.ts, environment.prod.ts, environment.ts, wrap-imports-with-regions`       |`node wrap-imports-with-regions.js excluded='environment.ts, polyfills.ts, node_modules'`  |
