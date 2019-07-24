import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import Basemap = require("esri/Basemap");
import Point = require("esri/geometry/Point");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import PopupTemplate = require("esri/PopupTemplate");

const map = new EsriMap({
  basemap: "streets" as any as Basemap
});

const view = new SceneView({
  map: map,
  container: "viewDiv",
  camera: { // autocasts as new Camera()
    position: { // autocasts as new Point()
      x: -85.48171,
      y: 32.595,
      z: 1400
    },
    heading: 0.34445102566290225,
    tilt: 42.95536300536367
  }
});

/*********************
 * Add graphics layer
 *********************/

let graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

/*************************
 * Add a 3D point graphic
 *************************/

// Auburn
let point = new Point({
  //type: "point", // autocasts as new Point()
  x: -85.48171,
  y: 32.6065,
  z: 252
});

let markerSymbol = {
  type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
  color: [226, 119, 40],
  outline: { // autocasts as new SimpleLineSymbol()
    color: [255, 255, 255],
    width: 2
  }
};

let pointGraphic = new Graphic({
  geometry: point,
  symbol: markerSymbol,
  popupTemplate: new PopupTemplate({
    title: "Toomers Corner",
    content: "<iframe width=\"460\" height=\"259\" src=\"https://www.youtube.com/embed/wVDtzDwo-1Q\" frameborder=\"0\" autoplay allowfullscreen></iframe>"
  })
});

graphicsLayer.add(pointGraphic);

/****************************
 * Add a 3D polyline graphic
 ****************************/

let polyline = new Polyline({
  //type: "polyline", // autocasts as new Polyline()
  paths: [[
    [-85.48171, 32.6065, 0],
    [-85.48171, 32.6065, 250]
  ]]
});

let lineSymbol = {
  type: "simple-line", // autocasts as SimpleLineSymbol()
  color: [226, 119, 40],
  width: 4
};

let polylineGraphic = new Graphic({
  geometry: polyline,
  symbol: lineSymbol
});

graphicsLayer.add(polylineGraphic);
