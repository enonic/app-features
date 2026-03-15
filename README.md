# Features App

This application is used for testing features for Enonic XP. It follows
our main Enonic XP releases.

## Building

Build all code and run all tests:

    ./gradlew build

Build all code skipping all tests:

    ./gradlew build -x test

To publish the app to our repository:

    ./gradlew publish
