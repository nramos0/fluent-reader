# Fluent Reader

Fluent Reader is a free, open-source web application for assisted reading of articles, books, or other material written in foreign languages. When reading things in another language, it's common to run into words or expressions that we don't know, but it can be annoying to constantly need to search for definitions online manually. Fluent Reader helps remedy this by automating this process and giving other tools to improve language learning efficiency.

-   **Technology stack**: The frontend is written in Typescript with React, and the backend is written in Rust with Actix Web.
-   **Status**: Fluent Reader is currently in a very early Alpha state. It is usable, but contains many limitations and lacks many potential features.
-   Fluent Reader was previously live at https://fluentreader.cc, but I have since taken the app down as of March 24, 2023. I leave the code here as an archive but I no longer update or maintain it.

Below is the reader page in the app.

![](app.png)

Words that the user has not seen or marked before in the app are highlighted in blue, meaning "new", words that the user has seen before but doesn't fully know yet are highlighted in red, meaning "learning", and words that the user has marked as knowing are not highlighted.

On the right side is the dictionary, where the user can look up words, save definitions for them, and set the current status of a particular word.

## Features

-   Support for reading English and Chinese texts
-   UI in English and Chinese
-   Import any article by pasting text
-   Find public articles published officially on Fluent Reader (System Library) and articles published by other users (All User Articles Library)
-   Save articles from the "System" or "All User" libraries to "Saved" library
-   Highlight words in different colors based on status (New: Blue, Learning: Red, Known: No Color)
-   Change word status on demand
-   Search for word definitions in a new tab in one click
-   Save custom definitions for different words
-   Underline words or phrases in different colors with the Pen tool
-   Set all "new" words on a page to "known" by moving to the next page with "Paging changes words to known" setting

## User Manual

You can find a more detailed and clear guide on how to use Fluent Reader [here](USER_MANUAL.md).

## Getting help

If you need help using Fluent Reader, or if you have questions, concerns, bug reports, etc, you can file an issue in this repository's Issue Tracker, or you can email me at [xoen000@163.com](mailto::xoen000@163.com) in English or Chinese.

## Contributing

If you're interested in contributing to Fluent Reader, please email me at [xoen000@163.com](mailto::xoen000@163.com) in English or Chinese. There is not any solid documentation yet, but I would be happy to help you find something to do and get started.

## Running your own server

Note that there is nothing stopping you from running a Fluent Reader server of your own, either locally on your own computer or on the internet somewhere. This way you could potentially get much faster response times from the server, or you could have your own "private" Fluent Reader server that only contains your own articles. If you're interested in doing this but aren't sure how, feel free to contact me!

## Installation

### Dependencies

To be run locally, the frontend requires [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) to be installed. The backend requries [Rust](https://www.rust-lang.org/).

### Frontend

The frontend was bootstrapped with [Create React App](https://create-react-app.dev/), so the following steps can get the frontend running locally:

-   In the root directory of the frontend, run `yarn install`
-   `yarn start`

### Backend

The following steps can get the backend running locally:

-   In the root directory of the backend, run `yarn install`
-   `yarn start`

Note: The backend uses a `package.json` with `yarn` for the `start` script and `lint-staged`/`husky`, to allow for pre-commit formatting. The `yarn start` script runs `cargo watch`, so the code will be recompiled on save.

## License

Both the frontend and backend code for Fluent Reader are licensed under the GNU General Public License (Version 3).
