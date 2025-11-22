# API Specification
## RPSFull Tournament Platform

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. API Overview

### 1.1 General Information
- **Base URL**: `https://api.rpsfull.com/api/v1`
- **Protocol**: HTTPS only
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **API Style**: RESTful
- **Versioning**: URL-based (v1, v2, etc.)

### 1.2 API Design Principles
- Resource-based URLs
- HTTP verbs for actions (GET, POST, PUT, PATCH, DELETE)
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error messages
- HATEOAS links (where applicable)

### 1.3 Rate Limiting
- **Anonymous users**: 20 requests/minute
- **Authenticated users**: 100 requests/minute
- **Premium users**: 500 requests/minute (future)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## 2. Authentication & Authorization

### 2.1 Authentication Flow

**Registration**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "player@example.com",
      "role": "player"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "player@example.com",
      "role": "player",
      "lastLogin": "2025-11-22T10:30:00Z"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Refresh Token**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Logout**
```http
POST /auth/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2.2 Authorization Headers

All authenticated requests must include:
```http
Authorization: Bearer {accessToken}
```

---

## 3. Standard Response Format

### 3.1 Success Response

```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2025-11-22T10:30:00Z",
    "version": "1.0"
  }
}
```

### 3.2 Success Response with Pagination

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "timestamp": "2025-11-22T10:30:00Z"
  }
}
```

### 3.3 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email is required"
    }
  },
  "meta": {
    "timestamp": "2025-11-22T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### 3.4 HTTP Status Codes

**Success Codes:**
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST creating a resource
- `204 No Content`: Successful DELETE with no response body

**Client Error Codes:**
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded

**Server Error Codes:**
- `500 Internal Server Error`: Unexpected server error
- `502 Bad Gateway`: Upstream service error
- `503 Service Unavailable`: Service temporarily down

---

## 4. User Endpoints

### 4.1 Get Current User

```http
GET /users/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "player@example.com",
    "role": "player",
    "player": {
      "id": "player_uuid",
      "name": "John Doe",
      "displayName": "JohnnyRPS",
      "level": 15,
      "experience": 3500,
      "ranking": 42,
      "avatarUrl": "https://..."
    },
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### 4.2 Update User Profile

```http
PATCH /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "displayName": "NewDisplayName",
  "bio": "Rock Paper Scissors enthusiast"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "player_uuid",
    "displayName": "NewDisplayName",
    "bio": "Rock Paper Scissors enthusiast",
    "updatedAt": "2025-11-22T10:30:00Z"
  }
}
```

### 4.3 Get User Statistics

```http
GET /users/me/stats?gameTypeId={uuid}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "playerId": "uuid",
    "gameTypeId": "uuid",
    "totalMatches": 150,
    "matchesWon": 95,
    "matchesLost": 50,
    "matchesTied": 5,
    "winRate": 63.33,
    "currentWinStreak": 5,
    "longestWinStreak": 12,
    "totalRounds": 450,
    "roundsWon": 280,
    "moveStats": {
      "rock": {
        "used": 150,
        "won": 95,
        "lost": 50,
        "tied": 5,
        "winRate": 63.33
      },
      "paper": {
        "used": 145,
        "won": 90,
        "lost": 48,
        "tied": 7,
        "winRate": 62.07
      },
      "scissors": {
        "used": 155,
        "won": 95,
        "lost": 52,
        "tied": 8,
        "winRate": 61.29
      }
    },
    "avgMoveTimeMs": 1250,
    "fastestMoveMs": 450,
    "tournamentsEntered": 12,
    "tournamentsWon": 3
  }
}
```

---

## 5. Player Endpoints

### 5.1 Get Player by ID

```http
GET /players/{playerId}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "displayName": "JohnnyRPS",
    "level": 15,
    "experience": 3500,
    "ranking": 42,
    "avatarUrl": "https://...",
    "bio": "RPS enthusiast",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### 5.2 Search Players

```http
GET /players?search=john&limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "displayName": "JohnnyRPS",
      "level": 15,
      "ranking": 42
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 5.3 Get Player Leaderboard

```http
GET /players/leaderboard?gameTypeId={uuid}&limit=100

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "ranking": 1,
      "playerId": "uuid",
      "name": "Champion Player",
      "displayName": "TheChamp",
      "level": 50,
      "totalMatches": 1000,
      "winRate": 85.5
    },
    {
      "ranking": 2,
      "playerId": "uuid2",
      "name": "Runner Up",
      "displayName": "SecondBest",
      "level": 48,
      "totalMatches": 950,
      "winRate": 82.3
    }
  ]
}
```

---

## 6. Game Type Endpoints

### 6.1 List Game Types

```http
GET /game-types?active=true

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Classic RPS",
      "description": "Traditional Rock, Paper, Scissors",
      "symbolCount": 3,
      "symbols": [
        {"id": "rock", "name": "Rock", "emoji": "🪨"},
        {"id": "paper", "name": "Paper", "emoji": "📄"},
        {"id": "scissors", "name": "Scissors", "emoji": "✂️"}
      ],
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### 6.2 Get Game Type Details

```http
GET /game-types/{gameTypeId}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Classic RPS",
    "description": "Traditional Rock, Paper, Scissors",
    "symbolCount": 3,
    "symbols": [
      {"id": "rock", "name": "Rock", "emoji": "🪨"},
      {"id": "paper", "name": "Paper", "emoji": "📄"},
      {"id": "scissors", "name": "Scissors", "emoji": "✂️"}
    ],
    "winMatrix": {
      "rock": ["scissors"],
      "paper": ["rock"],
      "scissors": ["paper"]
    },
    "tieRules": "replay",
    "scoringMethod": "best_of_n",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### 6.3 Create Custom Game Type (Future)

```http
POST /game-types
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "RPS-Lizard-Spock",
  "description": "Rock Paper Scissors Lizard Spock",
  "symbolCount": 5,
  "symbols": [
    {"id": "rock", "name": "Rock", "emoji": "🪨"},
    {"id": "paper", "name": "Paper", "emoji": "📄"},
    {"id": "scissors", "name": "Scissors", "emoji": "✂️"},
    {"id": "lizard", "name": "Lizard", "emoji": "🦎"},
    {"id": "spock", "name": "Spock", "emoji": "🖖"}
  ],
  "winMatrix": {
    "rock": ["scissors", "lizard"],
    "paper": ["rock", "spock"],
    "scissors": ["paper", "lizard"],
    "lizard": ["paper", "spock"],
    "spock": ["scissors", "rock"]
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "new_uuid",
    "name": "RPS-Lizard-Spock",
    "isActive": true,
    "createdAt": "2025-11-22T10:30:00Z"
  }
}
```

---

## 7. Match Endpoints

### 7.1 Create Quick Match

```http
POST /matches
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "player2Id": "opponent_uuid",
  "gameTypeId": "gametype_uuid",
  "bestOfN": 3,
  "playMode": "digital"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "match_uuid",
    "player1Id": "current_user_player_uuid",
    "player2Id": "opponent_uuid",
    "gameTypeId": "gametype_uuid",
    "matchFormat": "best_of_3",
    "bestOfN": 3,
    "playMode": "digital",
    "status": "pending",
    "createdAt": "2025-11-22T10:30:00Z"
  }
}
```

### 7.2 Get Match Details

```http
GET /matches/{matchId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "match_uuid",
    "player1": {
      "id": "player1_uuid",
      "name": "Player One",
      "displayName": "P1"
    },
    "player2": {
      "id": "player2_uuid",
      "name": "Player Two",
      "displayName": "P2"
    },
    "gameType": {
      "id": "gametype_uuid",
      "name": "Classic RPS"
    },
    "matchFormat": "best_of_3",
    "bestOfN": 3,
    "status": "completed",
    "winner": {
      "id": "player1_uuid",
      "name": "Player One"
    },
    "player1Score": 2,
    "player2Score": 1,
    "totalRounds": 3,
    "rounds": [
      {
        "roundNumber": 1,
        "player1Move": "rock",
        "player2Move": "scissors",
        "result": "player1_win",
        "timestamp": "2025-11-22T10:31:00Z"
      },
      {
        "roundNumber": 2,
        "player1Move": "paper",
        "player2Move": "rock",
        "result": "player1_win",
        "timestamp": "2025-11-22T10:31:15Z"
      },
      {
        "roundNumber": 3,
        "player1Move": "scissors",
        "player2Move": "rock",
        "result": "player2_win",
        "timestamp": "2025-11-22T10:31:30Z"
      }
    ],
    "durationSeconds": 45,
    "startedAt": "2025-11-22T10:30:30Z",
    "completedAt": "2025-11-22T10:31:15Z"
  }
}
```

### 7.3 Start Match

```http
PATCH /matches/{matchId}/start
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "match_uuid",
    "status": "in_progress",
    "startedAt": "2025-11-22T10:30:00Z"
  }
}
```

### 7.4 Submit Round (Digital Mode)

```http
POST /matches/{matchId}/rounds
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roundNumber": 1,
  "move": "rock",
  "timeTakenMs": 1250
}

Response: 201 Created
{
  "success": true,
  "data": {
    "roundNumber": 1,
    "yourMove": "rock",
    "opponentMove": null,  // null if opponent hasn't moved yet
    "result": null,  // null until both moves submitted
    "waiting": true  // waiting for opponent
  }
}

// Once both players submit:
{
  "success": true,
  "data": {
    "roundNumber": 1,
    "yourMove": "rock",
    "opponentMove": "scissors",
    "result": "win",  // "win", "loss", or "tie"
    "winnerId": "your_player_uuid",
    "matchComplete": false,
    "currentScore": {
      "player1": 1,
      "player2": 0
    }
  }
}
```

### 7.5 Record Match (Live Mode)

```http
POST /matches/{matchId}/record-round
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roundNumber": 1,
  "player1Move": "rock",
  "player2Move": "scissors",
  "winnerId": "player1_uuid"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "roundNumber": 1,
    "result": "player1_win",
    "currentScore": {
      "player1": 1,
      "player2": 0
    },
    "matchComplete": false
  }
}
```

### 7.6 Get My Matches

```http
GET /matches/my?status=completed&limit=20&page=1
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "match_uuid",
      "opponent": {
        "id": "opponent_uuid",
        "name": "Opponent Name"
      },
      "gameType": "Classic RPS",
      "result": "win",  // "win", "loss", "tie"
      "myScore": 2,
      "opponentScore": 1,
      "completedAt": "2025-11-22T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 7.7 Cancel Match

```http
DELETE /matches/{matchId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Match cancelled successfully"
}
```

---

## 8. Tournament Endpoints

### 8.1 Create Tournament

```http
POST /tournaments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Weekly RPS Championship",
  "description": "Weekly championship tournament",
  "gameTypeId": "gametype_uuid",
  "tournamentType": "single_elimination",
  "matchFormat": "best_of_3",
  "bestOfN": 3,
  "maxParticipants": 16,
  "startDate": "2025-11-25T18:00:00Z",
  "registrationDeadline": "2025-11-25T17:00:00Z",
  "rules": "Standard rules apply",
  "prizeInfo": "Winner gets bragging rights"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "tournament_uuid",
    "name": "Weekly RPS Championship",
    "status": "draft",
    "organizerId": "your_user_uuid",
    "createdAt": "2025-11-22T10:30:00Z"
  }
}
```

### 8.2 Get Tournament Details

```http
GET /tournaments/{tournamentId}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "tournament_uuid",
    "name": "Weekly RPS Championship",
    "description": "Weekly championship tournament",
    "gameType": {
      "id": "gametype_uuid",
      "name": "Classic RPS"
    },
    "organizer": {
      "id": "user_uuid",
      "name": "Tournament Organizer"
    },
    "tournamentType": "single_elimination",
    "matchFormat": "best_of_3",
    "status": "in_progress",
    "currentRound": 2,
    "totalRounds": 4,
    "maxParticipants": 16,
    "participantCount": 16,
    "startDate": "2025-11-25T18:00:00Z",
    "registrationDeadline": "2025-11-25T17:00:00Z",
    "createdAt": "2025-11-22T10:00:00Z"
  }
}
```

### 8.3 List Tournaments

```http
GET /tournaments?status=registration&limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "tournament_uuid",
      "name": "Weekly RPS Championship",
      "gameType": "Classic RPS",
      "status": "registration",
      "participantCount": 8,
      "maxParticipants": 16,
      "startDate": "2025-11-25T18:00:00Z",
      "registrationDeadline": "2025-11-25T17:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 8.4 Register for Tournament

```http
POST /tournaments/{tournamentId}/register
Authorization: Bearer {accessToken}

Response: 201 Created
{
  "success": true,
  "data": {
    "tournamentId": "tournament_uuid",
    "playerId": "your_player_uuid",
    "seed": 9,
    "status": "registered",
    "registeredAt": "2025-11-22T10:30:00Z"
  }
}
```

### 8.5 Add Player to Tournament (Organizer Only)

```http
POST /tournaments/{tournamentId}/players
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "playerId": "player_uuid",
  "seed": 1
}

Response: 201 Created
{
  "success": true,
  "data": {
    "tournamentId": "tournament_uuid",
    "playerId": "player_uuid",
    "seed": 1,
    "status": "registered"
  }
}
```

### 8.6 Get Tournament Bracket

```http
GET /tournaments/{tournamentId}/bracket

Response: 200 OK
{
  "success": true,
  "data": {
    "tournamentId": "tournament_uuid",
    "currentRound": 2,
    "totalRounds": 4,
    "rounds": [
      {
        "round": 1,
        "name": "Round of 16",
        "matches": [
          {
            "matchId": "match1_uuid",
            "position": 1,
            "player1": {
              "id": "p1_uuid",
              "name": "Player 1",
              "seed": 1
            },
            "player2": {
              "id": "p2_uuid",
              "name": "Player 2",
              "seed": 16
            },
            "winner": {
              "id": "p1_uuid",
              "name": "Player 1"
            },
            "status": "completed",
            "score": "2-1"
          }
        ]
      },
      {
        "round": 2,
        "name": "Quarter Finals",
        "matches": [
          {
            "matchId": "match9_uuid",
            "position": 1,
            "player1": {
              "id": "p1_uuid",
              "name": "Player 1"
            },
            "player2": {
              "id": "p3_uuid",
              "name": "Player 3"
            },
            "winner": null,
            "status": "in_progress",
            "score": "1-1"
          }
        ]
      }
    ]
  }
}
```

### 8.7 Get Tournament Standings

```http
GET /tournaments/{tournamentId}/standings

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "placement": 1,
      "player": {
        "id": "player_uuid",
        "name": "Champion",
        "displayName": "TheChamp"
      },
      "seed": 3,
      "matchesWon": 4,
      "matchesLost": 0,
      "roundsWon": 8,
      "roundsLost": 2,
      "status": "active"
    },
    {
      "placement": 2,
      "player": {
        "id": "player2_uuid",
        "name": "Runner Up"
      },
      "seed": 1,
      "matchesWon": 3,
      "matchesLost": 1,
      "roundsWon": 7,
      "roundsLost": 4,
      "status": "eliminated"
    }
  ]
}
```

### 8.8 Start Tournament (Organizer Only)

```http
PATCH /tournaments/{tournamentId}/start
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "tournament_uuid",
    "status": "in_progress",
    "currentRound": 1,
    "totalRounds": 4,
    "bracketGenerated": true,
    "startedAt": "2025-11-25T18:00:00Z"
  }
}
```

### 8.9 Update Tournament

```http
PATCH /tournaments/{tournamentId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Tournament Name",
  "description": "Updated description",
  "rules": "New rules"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "tournament_uuid",
    "name": "Updated Tournament Name",
    "updatedAt": "2025-11-22T10:35:00Z"
  }
}
```

### 8.10 Delete Tournament (Organizer Only)

```http
DELETE /tournaments/{tournamentId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Tournament deleted successfully"
}
```

---

## 9. Statistics Endpoints

### 9.1 Get Global Statistics

```http
GET /stats/global?gameTypeId={uuid}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalPlayers": 10543,
    "totalMatches": 125876,
    "totalRounds": 389654,
    "avgMatchDuration": 67,
    "mostUsedMove": "rock",
    "moveDistribution": {
      "rock": 34.2,
      "paper": 33.1,
      "scissors": 32.7
    },
    "avgWinRate": 50.1
  }
}
```

### 9.2 Get Player vs Player Stats

```http
GET /stats/head-to-head?player1Id={uuid}&player2Id={uuid}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "player1": {
      "id": "p1_uuid",
      "name": "Player One"
    },
    "player2": {
      "id": "p2_uuid",
      "name": "Player Two"
    },
    "totalMatches": 15,
    "player1Wins": 9,
    "player2Wins": 6,
    "ties": 0,
    "player1WinRate": 60.0,
    "lastMatchDate": "2025-11-20T14:30:00Z",
    "moveBreakdown": {
      "player1": {
        "rock": {"used": 20, "won": 12},
        "paper": {"used": 18, "won": 11},
        "scissors": {"used": 17, "won": 8}
      },
      "player2": {
        "rock": {"used": 19, "won": 7},
        "paper": {"used": 16, "won": 8},
        "scissors": {"used": 20, "won": 9}
      }
    }
  }
}
```

---

## 10. Achievement Endpoints

### 10.1 Get Player Achievements

```http
GET /players/{playerId}/achievements

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "achievement_uuid",
      "achievementType": "first_win",
      "name": "First Victory",
      "description": "Win your first match",
      "iconUrl": "https://.../first-win.png",
      "rarity": "common",
      "earnedAt": "2025-01-15T14:30:00Z"
    },
    {
      "id": "achievement_uuid2",
      "achievementType": "win_streak_10",
      "name": "Unstoppable",
      "description": "Win 10 matches in a row",
      "iconUrl": "https://.../streak-10.png",
      "rarity": "rare",
      "earnedAt": "2025-03-10T10:15:00Z"
    }
  ]
}
```

---

## 11. WebSocket API

### 11.1 Connection

```javascript
// Connect to WebSocket server
const socket = io('wss://api.rps-tournament.com', {
  auth: {
    token: 'Bearer {accessToken}'
  }
});

// Join match room
socket.emit('match:join', {
  matchId: 'match_uuid'
});
```

### 11.2 Match Events

**Client to Server:**

```javascript
// Player ready
socket.emit('match:ready', {
  matchId: 'match_uuid'
});

// Submit move
socket.emit('match:move', {
  matchId: 'match_uuid',
  roundNumber: 1,
  move: 'rock',
  timeTakenMs: 1250
});

// Leave match
socket.emit('match:leave', {
  matchId: 'match_uuid'
});
```

**Server to Client:**

```javascript
// Opponent joined
socket.on('match:opponent-joined', (data) => {
  // data: { playerId, playerName }
});

// Countdown started
socket.on('match:countdown', (data) => {
  // data: { secondsRemaining: 3 }
});

// Both players moved
socket.on('match:round-complete', (data) => {
  /*
  data: {
    roundNumber: 1,
    player1Move: 'rock',
    player2Move: 'scissors',
    result: 'player1_win',
    winnerId: 'player1_uuid',
    currentScore: { player1: 1, player2: 0 }
  }
  */
});

// Match completed
socket.on('match:complete', (data) => {
  /*
  data: {
    matchId: 'match_uuid',
    winnerId: 'player1_uuid',
    finalScore: { player1: 2, player2: 1 },
    durationSeconds: 45
  }
  */
});

// Error occurred
socket.on('match:error', (error) => {
  // error: { code, message }
});
```

### 11.3 Tournament Events

```javascript
// Join tournament room
socket.emit('tournament:join', {
  tournamentId: 'tournament_uuid'
});

// Server events
socket.on('tournament:started', (data) => {
  // Tournament has started
});

socket.on('tournament:match-complete', (data) => {
  // A match in the tournament completed
  // data: { matchId, winnerId, nextRound }
});

socket.on('tournament:round-complete', (data) => {
  // A tournament round completed
  // data: { round, nextRoundMatches }
});

socket.on('tournament:complete', (data) => {
  // Tournament finished
  // data: { winnerId, finalStandings }
});
```

---

## 12. Error Codes

### 12.1 Authentication Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Token expired | 401 |
| AUTH_003 | Token invalid | 401 |
| AUTH_004 | Email not verified | 403 |
| AUTH_005 | Account suspended | 403 |

### 12.2 Validation Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| VAL_001 | Invalid email format | 422 |
| VAL_002 | Password too weak | 422 |
| VAL_003 | Required field missing | 422 |
| VAL_004 | Invalid enum value | 422 |
| VAL_005 | Value out of range | 422 |

### 12.3 Resource Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| RES_001 | Resource not found | 404 |
| RES_002 | Resource already exists | 409 |
| RES_003 | Cannot delete resource | 409 |
| RES_004 | Resource conflict | 409 |

### 12.4 Match Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| MATCH_001 | Match not found | 404 |
| MATCH_002 | Match already started | 409 |
| MATCH_003 | Match already completed | 409 |
| MATCH_004 | Not a participant | 403 |
| MATCH_005 | Invalid move | 422 |
| MATCH_006 | Move already submitted | 409 |

### 12.5 Tournament Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| TOUR_001 | Tournament not found | 404 |
| TOUR_002 | Tournament full | 409 |
| TOUR_003 | Registration closed | 409 |
| TOUR_004 | Already registered | 409 |
| TOUR_005 | Not organizer | 403 |
| TOUR_006 | Cannot start tournament | 409 |

---

## 13. Pagination

### 13.1 Query Parameters

```
?page=1        // Page number (default: 1)
?limit=20      // Items per page (default: 20, max: 100)
?sort=createdAt // Sort field
?order=desc    // Sort order (asc/desc)
```

### 13.2 Response Format

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 14. Filtering & Searching

### 14.1 Common Filters

```
?search=keyword     // Text search
?status=active      // Filter by status
?gameTypeId=uuid    // Filter by game type
?startDate=2025-11-01  // Date range start
?endDate=2025-11-30    // Date range end
```

### 14.2 Example

```http
GET /matches?status=completed&gameTypeId={uuid}&startDate=2025-11-01&limit=50
```

---

## 15. API Versioning

### 15.1 Version Strategy
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Current version: v1
- Version support: 6 months after new version release
- Breaking changes require new version

### 15.2 Deprecation Process
1. Announce deprecation 3 months in advance
2. Add `Deprecated` header to responses
3. Provide migration guide
4. Maintain for 6 months after announcement

---

## 16. API Testing

### 16.1 Postman Collection
Available at: `https://api.rps-tournament.com/docs/postman`

### 16.2 OpenAPI Specification
Available at: `https://api.rpsfull.com/docs/openapi.json`

### 16.3 API Playground
Interactive playground: `https://api.rpsfull.com/playground`

---

**Document Approval:**
- [ ] Backend Lead
- [ ] API Architect
- [ ] Frontend Lead

---

END OF DOCUMENT

