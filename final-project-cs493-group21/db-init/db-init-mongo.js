db.users.insertMany([
        {
                "name": "Admin",
                "email": "admin@beavitify.com",
                "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
                "admin": 1
        },
        {
                "name": "Kevin Neiger",
                "email": "neigerk@oregonstate.edu",
                "password": "$2a$08$Y2IHnr/PU9tzG5HKrHGJH.zH3HAvlR5i5puD5GZ1sHA/mVrHKci72",
                "admin": 0
        },
        {
                "name": "Alex Rash",
                "email": "rasha@orgeonstate.edu",
                "password": "$2a$08$bAKRXPs6fUPhqjZy55TIeO1e.aXud4LD81awrYncaCKJoMsg/s0c.",
                "admin": 0
        },
        {
                "name": "Tanner Rousseau",
                "email": "rousseat@oregonstate.edu",
                "password": "$2a$08$WvRkJm.bz3zoRnmA.aQZBewLopoe00nA4qbzbnLyS4eRbm2MFNkMO",
                "admin": 0
        },
        {
                "name": "Derek Jeong",
                "email": "jeongju@oregonstate.edu",
                "password": "$2a$08$FBStm3plzBCnh/MPIUsJ0.f7kJkp6aH47haXHb3HY.Gfygan7e8He",
                "admin": 0
        }
])

db.artists.insertMany([
        {
                "name": "Post Malone",
                "category": "Hip Hop"
        },
])