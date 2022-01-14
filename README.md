# Automan Tools

AutomanTools is an open-source annotation tools for self-driving AI.

## Feature

- Annotate 3D objects for PCD data
- Set your custom classes
- Export labels

## Usage

### preparation

```sh
$ yarn install
```

_Note that you will need to have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed._

### webapp

development

```sh
$ yarn webdev
```

build

```sh
$ yarn webbuild
```

### web deployment

Before deployment, you need to install firebase-tools
and to get invitation of this firebase project from `@eisuke-ueta` or `@kenshir0f`.

then install `firebase-tools`,

```sh
$ yarn global add firebase-tools
```

then, login to firebase

```sh
$ firebase login
```

and then, choose this firebase project.

```sh
$ firebase use
> * default (automan-tools)
```

if you cannot find this project, add it.

```sh
$ firebase use --add [this project]
```

deploy to firebase

```sh
$ firebase deploy --only hosting
```

### web storage

To upload apps and sample file, you also need to join firebase project,
and access to `console.firebase.google.com` → `Storage`, upload latest files.

### electron

```sh
$ yarn dev
```

build

```
$ yarn package
```

A boilerplate for [Electron](https://www.electronjs.org/), [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) projects with hot reload capabilities.
