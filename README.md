# Features App

This application is used for testing features for Enonic XP. It follows
our main Enonic XP releases.

## Releases

Here's a list of released versions with compatibility notes:

* [6.0.0](http://repo.enonic.com/public/com/enonic/app/features/1.0.0/superhero-1.0.0.jar) - Enonic XP 6.0.0

## Building

Build all code and run all tests:

    ./gradlew build

Build all code skipping all tests:

    ./gradlew build -x test

To publish the app to our repository:

    ./gradlew clean build uploadArchives
