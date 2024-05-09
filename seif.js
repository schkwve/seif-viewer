var inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
var canvas1 = document.getElementById('canv0');
var ctx1 = canvas1.getContext('2d');

function handleFiles(e) {
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.addEventListener("load", processImage, false);
	reader.readAsArrayBuffer(file);
}

function processImage(e) {
	var buffer = e.target.result;
	var seif = parseSEIF(buffer);
	var imageData = convertToImageData(seif);
	ctx1.putImageData(imageData, 0, 0);
}

function parseSEIF(buffer) {
	var datav = new DataView(buffer);
	var seif = {};

	seif.header = {};
	seif.header.magic = new Uint8Array(buffer, 0, 4);
	console.log("seif.header.magic: " + seif.header.magic);
	seif.header.flags = datav.getUint8(4);
	console.log("seif.header.flags: " + seif.header.flags);
	seif.header.encoding = datav.getUint8(5);
	console.log("seif.header.encoding: " + seif.header.encoding);
	seif.header.chunk_count = datav.getUint32(22, true);
	console.log("seif.header.chunk_count: " + seif.header.chunk_count);
	seif.header.chunk_size = datav.getUint32(26, true);
	console.log("seif.header.chunk_size: " + seif.header.chunk_size);

	seif.metadata = {};
	seif.metadata.signature = new Uint8Array(buffer, 6, 8);
	console.log("seif.metadata.signature: " + seif.metadata.signature);
	seif.metadata.width = datav.getUint32(14, true);
	console.log("seif.metadata.width: " + seif.metadata.width);
	seif.metadata.height = datav.getUint32(18, true);
	console.log("seif.metadata.height: " + seif.metadata.height);
	seif.pixels = new Uint8Array(buffer, 30);
	return seif;
}

function convertToImageData(seif) {
	canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var width = seif.metadata.width;
	var height = seif.metadata.height;
	var imageData = ctx.createImageData(width, height);
	var data = imageData.data;
	var bmpdata = seif.pixels;

	for (var y = 0; y < height; ++y) {
		for (var x = 0; x < width; ++x) {
			var index1 = (x+width*(height-y))*4;
			var index2 = y * width + x;
			data[index1] = bmpdata[index2 + 2];
			data[index1 + 1] = bmpdata[index2 + 1];
			data[index1 + 2] = bmpdata[index2];
			data[index1 + 3] = 255;
		}
	}
	return imageData;
}
