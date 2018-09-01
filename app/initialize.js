const mapboxgl = require('mapbox-gl');
const distance = require('@turf/distance');

const mapConfig = {
  zoomThreshold: 6,
  layers: [ 
    {
      id: 'pipelines',
      name: 'Pipelines',
      layerIds: [ 'pipelines' ],
      dataStyle: false
    },
    {
      id: 'pipelines-releases',
      name: 'Leaky Pipelines',
      layerIds: [ 'pipeline-releases' ],
      dataStyle: [ 'line-color', 'line-width' ]
    },
    {
      id: 'incidents',
      name: 'Releases',
      layerIds: [ 'incidents' ],
      dataStyle: [ 'circle-radius' ]
    }
  ],
  dataProps: [
    { 
      id: 'crude_oil',
      name: 'Crude Oil',
      steps: {
        "circle-radius": [
          [ 0.01, 5 ],
          [ 1000, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 1500, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 1500, 10 ]
        ]
      }
    },
    {
      id: 'produced_water',
      name: 'Salt/Produced Water',
      steps: {
        "circle-radius": [
          [ 0.1, 4 ],
          [ 5000, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 5000, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 5000, 10 ]
        ]
      }
    },
    { 
      id: 'liquid_petroleum',
      name: 'Liquid Petroleum',
      steps: {
        "circle-radius": [
          [ 0.001, 1 ],
          [ 460, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 460, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 460, 10 ]
        ]
      }
    },
    { 
      id: 'waste',
      name: 'Waste',
      steps: {
        "circle-radius": [
          [ 0.001, 1 ],
          [ 7100, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 7100, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 7100, 10 ]
        ]
      }
    },
    { 
      id: 'condensate',
      name: 'Condensate',
      steps: {
        "circle-radius": [
          [ 0.001, 1 ],
          [ 675, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 675, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 675, 10 ]
        ]
      }
    },
    { 
      id: 'crude_bitumen',
      name: 'Crude Bitumen',
      steps: {
        "circle-radius": [
          [ 0.001, 1 ],
          [ 2522, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 2522, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 2522, 10 ]
        ]
      }
    },
    { 
      id: 'total',
      name: 'All',
      steps: {
        "circle-radius": [
          [ 0.001, 1 ],
          [ 6500, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 6500, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 0 ],
          [ 0.01, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    } 
  ]
}

let state = {
  dataProp: 'crude_oil',
  hovered: {}
}

document.addEventListener('DOMContentLoaded', () => {

  mapboxgl.accessToken = 'pk.eyJ1IjoibGFuZW9sc29uIiwiYSI6ImNpam5xcnNkNzAwcmR1Zmx4eWJjNG0yMXAifQ.Plo4_uETZU-n5Nsxz0aTOg';
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'map/style.json'
  });
  addDataSelect('menu', map);
  addLayerToggles('menu', map);
  map.on('load', function() {
    switchDataProp(mapConfig.dataProps[0], map);
    initMapHover(map);
    initMapMove(map);
    setInterval(function() {
      var features = map.queryRenderedFeatures({ layers: [ 'pipelines' ] });
      console.log('pipelines', features);
    },4000);
  })
});

function getPropById(id) {
  return mapConfig.dataProps.find(function(l) {
    return l.id === id;
  });
}

function getLayerByName(name) {
  return mapConfig.layers.find(function(l) {
    return l.name === name;
  });
}

function initMapHover(map) {
  map.on('mousemove', function (e) {
    if (map.getZoom() > mapConfig.zoomThreshold) {
      var features = map.queryRenderedFeatures(e.point, { layers: [ 'incidents' ] });
      addSpillDetails(features);
      var featureIds = features.map(function(f) { return f['properties']['pipeline_id']; });
      highlightFeatures('composite', featureIds, map);
      console.log('hovered ' + features.length + ' features:', features);
      // document.getElementById('debug').innerHTML = JSON.stringify(debug, null, 2);
    }
  });
} 

function initMapMove(map) {
  map.on('moveend', function(e) {
    var features = map.queryRenderedFeatures({ layers: [ 'incidents' ] });
    displayTotals(features);
  });
}

function displayTotals(features) {
  const total = features.reduce((acc, curr) => {
    return curr.properties.hasOwnProperty(state.dataProp) ? 
      acc + curr['properties'][state.dataProp] :
      acc
  }, 0);
  const parent = document.getElementById('total');
  parent.innerHTML = Math.round(total*1000) + ' litres released in current view'; 
}

/**  
 * Map style updates
 */
function updateLayerStyle(layer, prop, map) {
  layer.dataStyle.forEach(function(styleProp) {
    var steps = [ "interpolate", ["linear"], ["get", prop.id] ];
    var fallback = (styleProp === 'line-width' || styleProp === 'circle-radius') ? 0 : 'rgba(0,0,0,0)';
    if (prop.steps.hasOwnProperty(styleProp)) {
      prop.steps[styleProp].forEach(function(s) {
        steps.push(s[0], s[1]);
      });
      var newStyle = [ "case", ["has", prop.id], steps, fallback ];
      layer.layerIds.forEach(function(layerId) {
        map.setFilter(layerId, ["has", prop.id]);
        map.setPaintProperty(layerId, styleProp, newStyle);
      });
    }
  });
}

function highlightFeatures(source, featureIds, map) {
  console.log(featureIds); 
  if (state.hovered.hasOwnProperty(source)) {
    state.hovered[source].forEach(function(fid) {
      map.setFeatureState({source: source, sourceLayer: 'pipelines', id: fid}, { hover: false});
    });
  }
  if (featureIds.length > 0) {
    featureIds.forEach(function(f) {
      var featId = f;
      map.setFeatureState({source: source, sourceLayer: 'pipelines', id: f}, { hover: true});
    });
    state.hovered[source] = featureIds;
  }
}

function switchDataProp(newProp, map) {
  var updateLayers = mapConfig.layers.filter(function(l) { return l.dataStyle.length > 0 });
  updateLayers.forEach(function(l) {
    updateLayerStyle(l, newProp, map);
    state['dataProp'] = newProp.id;
    // l.dataStyle.indexOf('line-width') > -1 ? updateLineLayer(l, newProp, map) : updateCircleLayer(l, newProp, map);
  });
}

/**
 * UI Elements
 */

function addSpillDetails(features) {

  function createSpillListItem(feature) {
    const item = document.createElement('li');
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateObj = new Date(feature.properties['date']*1000);
    item.innerHTML = `
      <span class="item-label">Amount: </span>
      <span class="item-value">${feature.properties[state['dataProp']]}</span>
      <span class="item-label">Date: </span>
      <span class="item-value">${dateObj.toLocaleDateString("en-US", dateOptions)}</span>
    `;
    return item;
  }

  const parent = document.getElementById('spills');

  parent.innerHTML = '';
  if (features.length > 0) {
    parent.className = 'active';
    features
      .sort(function(a, b) {

      })
      .forEach(function(f) {
        parent.appendChild(createSpillListItem(f));
      });
  } else {
    parent.className = '';
  }

}
 
// Data select for data props in config
function addDataSelect(parentId, map) {
  var myDiv = document.getElementById(parentId);

  //Create array of options to be added
  var selectPropNames = mapConfig.dataProps.map(function(p) {
    return p.name;
  });
  
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.id = "mySelect";
  myDiv.appendChild(selectList);
  
  //Create and append the options
  for (var i = 0; i < mapConfig.dataProps.length; i++) {
    var option = document.createElement("option");
    option.value = mapConfig.dataProps[i].id;
    option.text = mapConfig.dataProps[i].name;
    selectList.appendChild(option);
  }

  selectList.onchange = function(e) {
    if (e.target.value) {
      var prop = getPropById(e.target.value);
      switchDataProp(prop, map);
    }
  }
}

// Buttons to toggle layers in config
function addLayerToggles(parentId, map) {

  var toggleableLayerIds = mapConfig.layers.map(function(l) {
    return l.name;
  });

  for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('button');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = getLayerByName(this.textContent);
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer.layerIds[0], 'visibility');

        clickedLayer.layerIds.forEach(function(layerId) {
          if (visibility === 'visible') {
              map.setLayoutProperty(layerId, 'visibility', 'none');
          } else {
              map.setLayoutProperty(layerId, 'visibility', 'visible');
          }
        });
        this.className = visibility === 'visible' ? '' : 'active';

    };

    var layers = document.getElementById(parentId);
    layers.appendChild(link);
  }  
}
