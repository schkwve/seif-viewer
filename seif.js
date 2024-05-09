var inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
var canv1 = document.getElementById('canv0');
var ctx1 = canv1.getContext('2d');

function handleFiles(e) {
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.addEventListener("load", processImage, false);
	reader.readAsArrayBuffer(file);
}

function processImage(e) {
	var seif = parseSEIF(e);
	var imageData = convertToImageData(seif);
	ctx1.putImageData(imageData, 0, 0);
}

function parseSEIF(e) {
	var buffer = e.target.result;
	var datav = new DataView(buffer);
	var seif = {};

	//
	// ----------------------
	// [OFF:END] | Name
	// ----------------------
	// <HEADER>
	// - [00:04] | Magic
	// - [04:05] | Flags
	// - [05:06] | Encoding
	// - [16:1A] | Chunk Count
	// - [1A:1E] | Chunk Size
	//
	// <METADATA>
	// - [06:0E] | Signature
	// - [0E:12] | Width
	// - [12:16] | Height
	//
	//

	seif.header = {};
	seif.header.magic = new Uint8Array(buffer, 0, 4);
	seif.header.flags = datav.getUint8(4);
	seif.header.encoding = datav.getUint8(5);
	seif.header.chunk_count = datav.getUint32(22, true);
	seif.header.chunk_size = datav.getUint32(26, true);

	seif.metadata = {};
	seif.metadata.signature = new Uint8Array(buffer, 6, 8);
	seif.metadata.width = datav.getUint32(14, true);
	seif.metadata.height = datav.getUint32(18, true);

	seif.pixels = new Uint8Array(buffer, 30);

	// print out debug info
	console.log("seif.header.magic: " + seif.header.magic);
	console.log("seif.header.flags: " + seif.header.flags);
	console.log("seif.header.encoding: " + seif.header.encoding);
	console.log("seif.header.chunk_count: " + seif.header.chunk_count);
	console.log("seif.header.chunk_size: " + seif.header.chunk_size);
	console.log("seif.metadata.signature: " + seif.metadata.signature);
	console.log("seif.metadata.width: " + seif.metadata.width);
	console.log("seif.metadata.height: " + seif.metadata.height);

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
