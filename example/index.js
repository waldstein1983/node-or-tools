'use strict';

// Query the Mapbox Distance Matrix API, run VRP solver on its output.
//
// The API returns a matrix with
// - the duration between location i and j
// - thus `0` on its diagonal i == j
// - and `null` if a route can not be found between i and j
//
// https://github.com/mapbox/mapbox-sdk-js/blob/master/API.md#getdistances
// https://www.mapbox.com/api-documentation/#directions-matrix
// https://www.mapbox.com/api-documentation/#directions
//
// Example output solution:
// http://bl.ocks.org/d/d0e91bc26f437aba812c554f7a5b1c2b

var util = require('util');

var Solver = require('../');
var Mapbox = require('mapbox');


// Here are all the tunables you might be interested in


var locations = [
  [13.414649963378906, 52.522905940278065],
  [13.363409042358397, 52.549218541178455],
  [13.394737243652344, 52.55062769982075],
  [13.426065444946289, 52.54640008814808],
  [13.375682830810547, 52.536534077147714],
  [13.39010238647461, 52.546191306649376],
  [13.351736068725584, 52.50754964045259],
  [13.418254852294922, 52.52927670688215],
];

var depotIndex = 0;
var numVehicles = 3;
var vehicleCapacity = 3;
var computeTimeLimit = 1000;
var profile = 'driving';

// that was a lie, there are more tunables below - start with the ones above first.


var MbxToken = process.env.MAPBOX_ACCESS_TOKEN;

if (!MbxToken) {
  console.error('Please set your Mapbox API Token: export MAPBOX_ACCESS_TOKEN=YourToken');
  process.exit(1);
}

var MbxClient = new Mapbox(MbxToken)


function hasNoRouteFound(matrix) {
  matrix.some(function (inner) {
    return inner.some(function (v) {
      return v === null;
    });
  });
}


MbxClient.getDistances(locations, {profile: profile}, function(err, results) {
  if (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }

  if (hasNoRouteFound(results.durations)) {
    console.error('Error: distance matrix is not complete');
    process.exit(1);
  }

  // 9am -- 5pm
  var dayStarts = 0;
  var dayEnds = 8 * 60 * 60;

  function costs(s, t) { return results.durations[s][t]; }
  function durations(s, t) { return 5 * 60 + results.durations[s][t]; }
  function timeWindows(at) { return [dayStarts, dayEnds]; }
  function demands(s, t) { return s === depotIndex ? 0 : 1; }
  function locks(vehicle) { return []; };

  var solverOpts = {
    numNodes: results.durations.length,
    costs: costs,
    durations: durations,
    timeWindows: timeWindows,
    demands: demands
  };

  var VRP = new Solver.VRP(solverOpts);

  var timeHorizon = dayEnds - dayStarts;

  var searchOpts = {
    computeTimeLimit: computeTimeLimit,
    numVehicles: numVehicles,
    depotNode: depotIndex,
    timeHorizon: timeHorizon,
    vehicleCapacity: vehicleCapacity,
    locks: locks
  };

  VRP.Solve(searchOpts, function (err, result) {
    if (err) {
      console.error('Error: ' + err.message);
      process.exit(1);
    }

    console.log(util.inspect(result, {showHidden: false, depth: null}));

    // Now that we have the location orders per vehicle make route requests to extract their geometry
    for (var i = 0; i < result.routes.length; ++i) {
      var route = result.routes[i];

      // Unused vehicle
      if (route.length === 0)
        continue;

      var waypoints = route.map(function(idx) {
        return {'longitude': locations[idx][0], 'latitude': locations[idx][1]};
      });

      // Add depot explicitly as start and end
      waypoints.unshift({'longitude': locations[depotIndex][0], 'latitude': locations[depotIndex][1]});
      waypoints.push({'longitude': locations[depotIndex][0], 'latitude': locations[depotIndex][1]});


      MbxClient.getDirections(waypoints, {profile: profile, alternatives: false}, function(err, results) {
        if (err) {
          console.error('Error: ' + err.message);
          process.exit(1);
        }

        console.log(results.routes[0].geometry);
      });
    }

  });
});