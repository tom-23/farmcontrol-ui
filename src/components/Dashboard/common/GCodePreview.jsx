import * as GCodePreview from 'gcode-preview';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';

function GCodePreviewUI(props, ref) {
  const {
	topLayerColor = '',
	lastSegmentColor = '',
	startLayer,
	endLayer,
	lineWidth
  } = props;
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState();

  const resizePreview = () => {
	preview?.resize();
  };

  useImperativeHandle(ref, () => ({
	getLayerCount() {
	  return preview?.layers.length;
	},
	processGCode(gcode) {
	  preview?.processGCode(gcode);
	}
  }));

  useEffect(() => {
	setPreview(
	  GCodePreview.init({
		canvas: canvasRef.current,
		startLayer,
		endLayer,
		lineWidth,
		topLayerColor: new THREE.Color(topLayerColor).getHex(),
		lastSegmentColor: new THREE.Color(lastSegmentColor).getHex(),
		buildVolume: { x: 250, y: 220, z: 150 },
		initialCameraPosition: [0, 400, 450],
		allowDragNDrop: false
	  })
	);

	window.addEventListener('resize', resizePreview);

	return () => {
	  window.removeEventListener('resize', resizePreview);
	};
  }, []);

  return (
	<div className="gcode-preview">
	  <canvas ref={canvasRef}></canvas>

	  <div>
		<div>topLayerColor: {topLayerColor}</div>
		<div>lastSegmentColor: {lastSegmentColor}</div>
		<div>startLayer: {startLayer}</div>
		<div>endLayer: {endLayer}</div>
		<div>lineWidth: {lineWidth}</div>
	  </div>
	</div>
  );
}

export default forwardRef(GCodePreviewUI);

