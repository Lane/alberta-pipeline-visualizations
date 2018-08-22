const mapboxgl = require('mapbox-gl');

const mapConfig = {
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
          [ 0.1, 1 ],
          [ 10, 10 ],
          [ 2000, 30 ],
          [ 6500, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 6500, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    },
    {
      id: 'produced_water',
      name: 'Salt/Produced Water',
      steps: {
        "circle-radius": [
          [ 0.1, 1 ],
          [ 10, 10 ],
          [ 2000, 30 ],
          [ 6500, 50 ]
        ],
        "line-color": [
          [ 0, "hsla(44, 23%, 68%, 0)" ],
          [ 0.1, "hsl(0, 100%, 63%)" ],
          [ 6500, "hsl(0, 100%, 33%)" ]
        ],
        "line-width": [
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    },
    { 
      id: 'liquid_petroleum',
      name: 'Liquid Petroleum',
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
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    },
    { 
      id: 'waste',
      name: 'Waste',
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
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    },
    { 
      id: 'condensate',
      name: 'Condensate',
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
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    },
    { 
      id: 'crude_bitumen',
      name: 'Crude Bitumen',
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
          [ 0, 1.5 ],
          [ 6500, 10 ]
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
          [ 0, 1.5 ],
          [ 6500, 10 ]
        ]
      }
    } 
  ]
}


document.addEventListener('DOMContentLoaded', () => {

  mapboxgl.accessToken = 'pk.eyJ1IjoibGFuZW9sc29uIiwiYSI6ImNpam5xcnNkNzAwcmR1Zmx4eWJjNG0yMXAifQ.Plo4_uETZU-n5Nsxz0aTOg';
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'map/style.json'
  });
  addDataSelect('menu', map);
  addLayerToggles('menu', map);
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
        map.setFilter(layerId, [">", prop.id, 0]);
        map.setPaintProperty(layerId, styleProp, newStyle);
      });
    }
  });
}

function switchDataProp(newProp, map) {
  var updateLayers = mapConfig.layers.filter(function(l) { return l.dataStyle.length > 0 });
  updateLayers.forEach(function(l) {
    updateLayerStyle(l, newProp, map);
    // l.dataStyle.indexOf('line-width') > -1 ? updateLineLayer(l, newProp, map) : updateCircleLayer(l, newProp, map);
  });
}

/**
 * UI Elements
 */
 
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
