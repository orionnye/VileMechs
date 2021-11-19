# VileMechs
A turn based strategy Deck builder.

Spaces:
    - pixel space
    - UI space
        basically the space where units correspond to one "artistic pixel" rather than screen pixels
    - world space
        units correspond to single tiles which are 32 grunits wide
        must apply inverse camera transform to go from grunit space to world space


# Setup

   ```git clone https://github.com/orionnye/VileMechs.git```
   ```cd VileMechs```
   ```npm install parcel```
   ```parcel src/index.html```
