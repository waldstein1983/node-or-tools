# node-or-tools

[![Build Status](https://travis-ci.com/mapbox/node-or-tools.svg?token=hLpUd9oZwpjSs5JzfqFa&branch=master)](https://travis-ci.com/mapbox/node-or-tools)

NodeJS bindings for or-tools Travelling Salesman Problem (TSP) and Vehicle Routing Problem (VRP) solvers.

See [API.md](API.md) for documentation.

Solving TSP and VRP problems always starts out with having a `m x m` cost matrix for all pairwise routes between all locations.
We recommend using the [Mapbox Directions Matrix](https://www.mapbox.com/api-documentation/#directions-matrix) service when optimizing travel times.

[![Example](https://raw.github.com/mapbox/node-or-tools/master/examples/solution.png)](https://github.com/mapbox/node-or-tools/blob/master/examples/solution.geojson)

### Installing

Update your Node.js and NPM versions via [nvm](https://github.com/creationix/nvm).

    nvm install 4
    nvm use 4

Then

    npm install

or if you are root

    npm install --unsafe-perm

We ship pre-built native binaries for which you will need a compatible C++ stdlib.

#### Ubuntu 14.04

```
apt install software-properties-common
add-apt-repository ppa:ubuntu-toolchain-r/test
apt update
apt install libstdc++-5-dev
```

#### Ubuntu 16.04

You're fine. The system's stdlib is recent enough.


### Tests

    npm test

See
- [npmjs.com/package/tap](https://www.npmjs.com/package/tap)
- [node-tap.org](http://www.node-tap.org)


### Building - Undefined Symbols

If your C++ compiler and stdlib are quite recent they will default to a new ABI.
Mason packages are still built against an old ABI.
If you see `undefined symbols` errors force the stdlib to use the old ABI by setting:

    export CXXFLAGS="-D_GLIBCXX_USE_CXX11_ABI=0"

and re-build the project.

### References

Routing Interfaces
- [RoutingModel](https://github.com/google/or-tools/blob/v5.1/src/constraint_solver/routing.h#L14)
- [RoutingSearchParameters](https://github.com/google/or-tools/blob/master/src/constraint_solver/routing_parameters.proto#L28)
- [RoutingModelParameters](https://github.com/google/or-tools/blob/master/src/constraint_solver/routing_parameters.proto#L263)

More or-tools
- Manual: [TSP](https://acrogenesis.com/or-tools/documentation/user_manual/manual/TSP.html) and [VRP](https://acrogenesis.com/or-tools/documentation/user_manual/manual/VRP.html)
- [Examples](https://github.com/google/or-tools/tree/v5.1/examples/cpp)
- [Reference](https://developers.google.com/optimization/reference/) - Main entry is `RoutingModel` in `constraint_solver/routing.h`

Node bindings
- [NAN2](https://github.com/nodejs/nan#api)
- [GYP](https://gyp.gsrc.io)

### License

Copyright © 2017 Mapbox

Distributed under the MIT License (MIT).
