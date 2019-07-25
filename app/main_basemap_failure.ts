import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import MapView = require("esri/views/MapView");
import Basemap = require("esri/Basemap");
import Point = require("esri/geometry/Point");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import PopupTemplate = require("esri/PopupTemplate");
import watchUtils = require("esri/core/watchUtils");
import { SimpleMarkerSymbol, SimpleLineSymbol } from "esri/symbols";
import TileLayer = require("esri/layers/TileLayer");
import { Extent } from "esri/geometry";

//MAP
const map = new EsriMap({
  basemap: "streets" as any as Basemap
});

//3D View
const sceneView = new SceneView({
  map: map,
  container: "viewDiv",
  extent: new Extent({
    xmin: 735122.7647182067,
    ymin: 749291.5682165455,
    xmax: 795309.2807898734,
    ymax: 783742.0792388171,
    spatialReference: {
        wkid: 102629
    }
  }),
  camera: { // autocasts as new Camera()
    position: { // autocasts as new Point()
      x: 755000, //-85.48171,
      y: 765000, //32.595,
      z: 1400
    },
    heading: 0.34445102566290225,
    tilt: 42.95536300536367
  }
});
sceneView.viewingMode = "local"; // helps if we ever have a 3D-capable basemap

//2D View
const mapView = new MapView({
  map: map,
  container: null, // "viewDiv",
  extent: new Extent({
    xmin: 735122.7647182067,
    ymin: 749291.5682165455,
    xmax: 795309.2807898734,
    ymax: 783742.0792388171,
    spatialReference: {
        wkid: 102629
    }
  }),
  zoom: 4,
  spatialReference: {
      wkid: 102629
  }
});

//Application Data - to manage switching and active states
let appConfig = {
  mapView: mapView,
  sceneView: sceneView,
  activeView: "3D"
};
// appConfig.activeScene = null; //default to 2D


/*********************
 * Add graphics layer
 *********************/

let graphicsLayer = new GraphicsLayer({id: 'marker'});
map.add(graphicsLayer);

/*********************
 * Listen and move graphics to center
 *********************/

watchUtils.whenTrue(appConfig.sceneView, "stationary", moveGraphic);
watchUtils.whenTrue(appConfig.mapView, "stationary", moveGraphic);
function moveGraphic() {
  var is3D = appConfig.activeView === "3D";
  let x = 755000;
  let y = 765000;
  let z = 250;

  if (appConfig.sceneView.center && is3D) {
    x = appConfig.sceneView.center.x;
    y = appConfig.sceneView.center.y;
  } else if (appConfig.mapView.center && !is3D) {
    x = appConfig.mapView.center.x;
    y = appConfig.mapView.center.y;
  }

  //2D/3D point graphic
  let pointGraphic = new Graphic({
    geometry: new Point({
      x: x,
      y: y,
      z: z+2,
      spatialReference: {
          wkid: 102629
      }
    }),
    symbol: new SimpleMarkerSymbol({
      color: [226, 119, 40],
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 2
      }
    }),
    popupTemplate: new PopupTemplate({
      title: "Toomers Corner",
      content: "<iframe width=\"460\" height=\"259\" src=\"https://www.youtube.com/embed/wVDtzDwo-1Q\" frameborder=\"0\" autoplay allowfullscreen></iframe>"
    })
  });

  /****************************
   * 3D polyline graphic
   ****************************/

  let polylineGraphic = new Graphic({
    geometry: new Polyline({
      paths: [[
        [x, y, 0],
        [x, y, z]
      ]],
      spatialReference: {
          wkid: 102629
      }
    }),
    symbol: new SimpleLineSymbol({
      color: [226, 119, 40],
      width: 4
    })
  });

  graphicsLayer.removeAll();
  graphicsLayer.addMany([pointGraphic, polylineGraphic]);
}

// Marker Logic
const markerButton = document.getElementById('marker-btn');
markerButton.addEventListener("click", toggleMarker);
function toggleMarker() {
  console.log(appConfig.sceneView.center);
  console.log(graphicsLayer);
  console.log(map);
  debugger;
}


//2D / 3D Switch Logic
const switchButton = document.getElementById("switch-btn") as HTMLInputElement;
const viewContainer = document.getElementById("viewDiv") as HTMLDivElement;
switchButton.addEventListener("click", switchView);

// Switches the view from 2D to 3D and vice versa
function switchView() {
  var is3D = appConfig.activeView === "3D";

  if (is3D) {
    // remove the reference to the container for the previous view

    // if the input view is a SceneView, set the viewpoint on the
    // mapView instance. Set the container on the mapView and flag
    // it as the active view
    appConfig.mapView.viewpoint = appConfig.sceneView.viewpoint.clone();
    appConfig.mapView.viewpoint.rotation = 0; //sets "North" up (could have changed in 3D)
    appConfig.sceneView.container = null;
    appConfig.mapView.container = viewContainer;
    appConfig.activeView = "2D";
    switchButton.value = "3D";
  } else {
    // remove the reference to the container for the previous view

    appConfig.sceneView.viewpoint = appConfig.mapView.viewpoint.clone();
    appConfig.mapView.container = null;
    appConfig.sceneView.container = viewContainer;
    appConfig.activeView = "3D";
    switchButton.value = "2D";
  }
}

const screenshotButton = document.getElementById("screenshot-btn") as HTMLInputElement;
screenshotButton.addEventListener("click", screenshotEvent)
function screenshotEvent() {
  var is3D = appConfig.activeView === "3D";
  let ssConfig = { width: 1920, height: 1280, format: "png" };

  if (is3D) {
    appConfig.sceneView.takeScreenshot(ssConfig).then((screen) => {
      let dataUrl = getImageWithLogoAndText(screen.data, document.getElementById('titleDiv').innerText);
      downloadImage("Example Title" + ".png", dataUrl);
    });
  } else {
    appConfig.mapView.takeScreenshot(ssConfig).then((screen) => {
      let dataUrl = getImageWithLogoAndText(screen.data, document.getElementById('titleDiv').innerText);
      downloadImage("Example Title" + ".png", dataUrl);
    });
  }
}

// returns a new image created by adding a custom text to the webscene image
function getImageWithLogoAndText(imageData:ImageData, text:string) {
  // to add the text to the screenshot we create a new canvas element
  const tcanvas = document.createElement("canvas");
  const tcontext = tcanvas.getContext("2d");
  //tcontext.createImageData(data);
  tcanvas.height = imageData.height;
  tcanvas.width = imageData.width;

  // // add the screenshot data to the canvas
  tcontext.putImageData(imageData, 0, 0);
  
  //return tcanvas.toDataURL();

  // add the logo 
  const img = document.getElementById('logo') as HTMLImageElement;
  tcontext.drawImage(img, tcanvas.width - img.width, 0);

  // add the text
  tcontext.font = "60px Arial";
  tcontext.fillStyle = "#000";
  tcontext.fillRect(
    0,
    imageData.height - 120,
    tcontext.measureText(text).width + 60,
    90
  );

  // add the text from the textInput element
  tcontext.fillStyle = "#fff";
  tcontext.fillText(text, 30, imageData.height - 50);
  
  return tcanvas.toDataURL('image/png');
}

function downloadImage(filename:string, dataUrl:string) {
  console.log(filename);
  // the download is handled differently in Microsoft browsers
  // because the download attribute for <a> elements is not supported
  if (!window.navigator.msSaveOrOpenBlob) {
    // in browsers that support the download attribute
    // a link is created and a programmatic click will trigger the download
    const element = document.createElement("a");
    element.setAttribute("href", dataUrl);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } else {
    // for MS browsers convert dataUrl to Blob
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    // download file
    window.navigator.msSaveOrOpenBlob(blob, filename);
  }
}
