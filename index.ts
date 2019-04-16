import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera, CubeCamera,
  Vector3, Box3, BoxGeometry,
  Color, Fog,
  HemisphereLight, SpotLight, PointLight,
  GridHelper, PlaneGeometry, DoubleSide,
  Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, SmoothShading
} from 'three';

class ThreeBox extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          min-height: 400px;
          line-height: 0;
        }
        canvas {
          width: 100%;
          min-height: 400px;
        }
        button {
          position: absolute;
          top: 20px;
          right: 20px;
          border-radius: 3px;
          border: 1px solid #ccc;
          padding: 5px;
        }
      </style>
      <canvas></canvas>
`;
  }
  static get properties() {
    return {
      selection: {
        notify: true,
        type: String,
        value: function() {
          return new String();
        }
      }
    };
  }
  constructor() {
    super();

    this._modelLoaded = false;
    this._pauseRender = false;

    this.fullscreen = 'Full Screen';
    this.backgroundcolor = 0xf1f1f1;
    this.floorcolor = 0x666666;
    this.modelcolor = 0xfffe57;
  }

  ready() {
    super.ready();
    console.log("ready");
    console.log(this.shadowRoot);

    this._scene = new Scene();
    this._scene.background = new Color(this.backgroundcolor);
    this._scene.fog = new Fog(this.backgroundcolor);
    this.__setGrid();
    this.__initRender();
    this.__render();
  }
  handleClick(e) {
    console.log('click');
  }
  _handleAjaxPostError(e) {
    console.log('error: ' + e);
  }

    /**
   * Fire up the renderer
   */
  __initRender() {
    const canvas = this.shadowRoot.querySelector('canvas');

    this._renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // TODO blah, this is dumb, polyfill ResizeObserver and use that
    window.addEventListener('resize', (e) => {
      try {
        ShadyDOM.flush();
      } catch(e) {
        // no shadydom for you
      }
    });
    this.__setCameraAndRenderDimensions();
  }

  /**
   * Setup the box grid for the bottom plane
   * @memberof StlPartViewer
   * @private
   */
  __setGrid() {
    // this._gridHelper = new GridHelper(1000, 50, 0xffffff, 0xffffff);
    // this._gridHelper.geometry.rotateX( Math.PI / 2 );
    // this._gridHelper.lookAt(new Vector3(0, 0, 1));
    var geometry = new BoxGeometry( 0.2, 0.2, 0.2 );
    var material = new MeshNormalMaterial();
    this._cube = new Mesh( geometry, material );
    this._scene.add( this._cube );

    // this._scene.add(this._gridHelper);
  }


  /**
   * Render all the things
   * @returns
   * @memberof StlPartViewer
   * @private
   */
  __render() {
    // The render will pause when the intersection observer says it's not in
    // view; we override this for the odd case where the canvas goes full screen
    if (this._pauseRender && !this.__isFullScreenElement()) {
      return;
    }
    this._cube.rotation.x += 0.01;
    this._cube.rotation.y += 0.01;
    // this.__updateReflection();
    requestAnimationFrame(() => this.__render());
    this._renderer.render(this._scene, this._camera);
  }

  /**
   * Define our single camera and its position
   * @memberof StlPartViewer
   * @private
   */
  __setCameraAndRenderDimensions() {
    // This is for the fullscreen exit; the offset is incorrect when checked
    // immediately, so we just cache it for speed
    // TODO track this on potential element resizing
    // console.log("window.offsetWidth");
    // console.log(window.offsetWidth);
    // this._elementDimensions = {
    //   'width': window.offsetWidth,
    //   'height': window.offsetHeight,
    // };

    this._camera = new PerspectiveCamera( 5, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // this._camera.position.set(-350, -100, 100)
    // this._camera.up = new Vector3(0, 0, 1);

    // this._camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this._camera.position.z = 5;

    this.__setProjectionMatrix(this.offsetWidth, this.offsetHeight);
  }

  /**
   * Set the render size and camera aspect ratio as needed based on display
   * height and width. Important for resize and full screen events (otherwise
   * we'll be blurring and stretched).
   * @param {Number} width
   * @param {Number} height
   * @memberof StlPartViewer
   * @private
   */
  __setProjectionMatrix(width, height) {
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }


}

window.customElements.define('wc-three-box', ThreeBox);