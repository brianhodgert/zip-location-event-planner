Forked on March 16, 2025 by Uncle Bri

Location-Based Event Networking and Management System
=====================================================

Overview
--------

This open-source repository provides a backend system for organizing and managing location-based events and networking. While the codebase is structured around pickup sports as an example, it is designed to be flexible and can be adapted to any location-based event management system.

The system allows users to create profiles, set their availability and preferences, join or create squads, manage friendships, send and receive event invitations, and search for events or participants based on location and availability. The backend is deployed using the Serverless Framework and requires minimal setup to get started.

Features
--------

*   **User Profile Management**: Create, update, and retrieve user profiles with location, availability, and event type preferences.
    
*   **Friend and Squad Management**: Add, delete, and retrieve friends; create, view, and manage squads.
    
*   **Event Management**: Create, update, retrieve, and search for events based on user preferences and availability.
    
*   **Event Participation**: Register for events, update event status, and manage event-related activities.
    
*   **Invitations System**: Send, accept, reject, and manage invitations for friends, squads, and events.
    
*   **Availability and Search**: Specify and retrieve event participation availability; search for available players or events within a given location and timeframe.
    

Deployment
----------

To deploy the backend, include the missing .env and config.yaml files and use the Serverless Framework to deploy the web services. The system is structured for easy deployment with minimal configuration changes.

### Prerequisites

*   Install Serverless Framework
    
*   Create and configure the required .env and config.yaml files
    
*   serverless deploy
    

API Endpoints
-------------

Below is a summary of the available API endpoints and their functions.

### User Profile

*   **GET /profile** - Retrieve user profile
    
*   **PUT /profile** - Update user profile
    
*   **POST /profile** - Create user profile
    

### Friend Management

*   **GET /friends** - Retrieve friends list
    
*   **DELETE /friends/{playerID}** - Remove a friend
    

### Squad Management

*   **GET /squads** - Retrieve list of squads
    
*   **GET /squads/{squadID}** - Retrieve squad details
    
*   **POST /squads** - Create a squad
    
*   **DELETE /squads/{squadID}** - Leave or delete a squad
    

### Invitations

*   **GET /invites** - Retrieve pending invitations
    
*   **PUT /invites/{inviteID}** - Accept or reject an invitation
    
*   **POST /invites** - Send an invitation
    

### Event Management

*   **GET /games/{gameID}** - Retrieve event details
    
*   **POST /games** - Create an event
    
*   **PUT /games/{gameID}** - Update event details
    
*   **PUT /gameStatus** - Update event participation status
    
*   **GET /registeredGames** - Retrieve list of registered events
    
*   **GET /suggestedGames?dateStamp={date}** - Get event suggestions based on preferences
    

### Availability & Search

*   **GET /playerAvailabilities** - Retrieve user event availabilities
    
*   **POST /playerAvailabilities** - Create a one-time availability
    
*   **DELETE /playerAvailabilities** - Remove a one-time availability
    
*   **GET /availablePlayers** - Search for available players based on activity, location, and timeframe
    
*   **GET /availableGames** - Search for available events based on activity, location, and timeframe
    

Customization
-------------

This backend is highly customizable and can be adapted for different use cases, including:

*   Networking events
    
*   Meetup groups
    
*   Conferences
    
*   Social gatherings
    
*   Any event-based matching system
    

Contributing
------------

Contributions are welcome! Feel free to submit issues or pull requests to improve the system.

License
-------

This project is open-source under the MIT License.
