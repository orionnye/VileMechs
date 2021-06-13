# DeckMeld1
Pulling together multiple projects to make a game. It's gonna be messy so here's the first attempt.

Spaces:
    - pixel space
    - UI space
        basically the space where units correspond to one "artistic pixel" (grunits) rather than screen pixels
    - world space
        units correspond to single tiles which are 32 grunits wide
        must apply inverse camera transform to go from grunit space to world space