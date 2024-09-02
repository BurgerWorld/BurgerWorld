document.addEventListener('DOMContentLoaded', function () {
    const stageContainer = document.getElementById('meme-stage');
    const containerWidth = stageContainer.offsetWidth;

    const stage = new Konva.Stage({
        container: 'meme-stage',
        width: containerWidth,
        height: containerWidth,
    });

    let layer = new Konva.Layer();
    stage.add(layer);

    let backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
    });
    layer.add(backgroundImage);

    let transparentRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: 'transparent',
    });
    layer.add(transparentRect);

    let tr = new Konva.Transformer({
        anchorSize: 20,
        padding: 5,
    });
    layer.add(tr);

    function resetTransformer() {
        tr.nodes([]);
        layer.add(tr);
        tr.moveToTop();
    }

    transparentRect.on('mousedown touchstart', function (e) {
        console.log('Transparent Rect clicked/touched');
        if (e.target === transparentRect) {
            resetTransformer();
            layer.draw();
        }
    });

    stage.on('mousedown touchstart', function (e) {
        if (e.target === stage) {
            console.log('Stage clicked/touched');
            resetTransformer();
            layer.draw();
        }
    });

    stage.on('contentTouchstart', function(e) {
        e.evt.preventDefault();
    });

    function addShapeEvents(shape) {
        shape.on('mousedown touchstart', function (e) {
            e.cancelBubble = true;
            console.log('Shape clicked/touched and transformer applied');
            tr.nodes([shape]);
            tr.getLayer().batchDraw();
        });

        shape.on('transformend dragend', function () {
            console.log('Transform or Drag Ended');
            layer.batchDraw();
        });

        // Add pinch-to-zoom functionality
        addPinchZoomToShape(shape);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = tr.nodes()[0];
            if (selectedNode) {
                console.log('Selected node deleted');
                selectedNode.destroy();
                resetTransformer();
                layer.draw();
            }
        }
    });

    const stickersPanel = document.getElementById('stickers-panel');

    document.getElementById('open-stickers').addEventListener('click', function () {
        console.log('Stickers panel opened');
        stickersPanel.classList.add('show');
        stickersPanel.style.display = 'grid';
    });

    document.getElementById('close-stickers').addEventListener('click', function () {
        console.log('Stickers panel closed');
        stickersPanel.classList.remove('show');
        stickersPanel.style.display = 'none';
    });

    const fileInput = document.getElementById('upload-image');
    fileInput.addEventListener('change', function (e) {
        console.log('Image uploaded');
        const reader = new FileReader();
        reader.onload = function () {
            const imageObj = new Image();
            imageObj.crossOrigin = "Anonymous";
            imageObj.src = reader.result;
            imageObj.onload = function () {
                console.log('Background image loaded');
                backgroundImage.image(imageObj);
                resizeStage();
                layer.draw();
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        fileInput.value = '';
    });

    document.getElementById('meme-text').addEventListener('click', function () {
        console.log('Text panel opened');
        document.getElementById('text-panel').style.display = 'block';
    });

    document.getElementById('cancel-text-button').addEventListener('click', function () {
        console.log('Text panel closed');
        document.getElementById('text-panel').style.display = 'none';
    });

    document.getElementById('add-text-button').addEventListener('click', function (e) {
        const newText = new Konva.Text({
            x: 50,
            y: 50,
            text: document.getElementById('new-meme-text').value,
            fontSize: 60,
            fontFamily: document.getElementById('font-select').value,
            fill: document.getElementById('color-picker').value,
            stroke: document.getElementById('stroke-color-picker').value,
            strokeWidth: parseInt(document.getElementById('stroke-width-slider').value, 10),
            draggable: true,
        });

        console.log('New text added:', newText.text());

        layer.add(newText);
        addShapeEvents(newText);
        tr.nodes([newText]);
        tr.getLayer().batchDraw();
        layer.draw();

        document.getElementById('text-panel').style.display = 'none';
    });

    document.querySelectorAll('.sticker').forEach(function (sticker) {
        sticker.addEventListener('click', function (e) {
            console.log('Sticker selected:', sticker.alt);
            const stickerImage = new Image();
            stickerImage.crossOrigin = "Anonymous";
            stickerImage.src = sticker.src;

            stickerImage.onload = function () {
                console.log('Sticker image loaded');
                const stageWidth = stage.width();
                const stageHeight = stage.height();
                
                // Calculate the scale to fit the sticker within 1/3 of the stage
                const scale = Math.min(
                    (stageWidth / 3) / stickerImage.width,
                    (stageHeight / 3) / stickerImage.height
                );

                const konvaSticker = new Konva.Image({
                    image: stickerImage,
                    draggable: true,
                    width: stickerImage.width * scale,
                    height: stickerImage.height * scale,
                });

                // Center the sticker
                konvaSticker.position({
                    x: (stageWidth - konvaSticker.width()) / 2,
                    y: (stageHeight - konvaSticker.height()) / 2,
                });

                layer.add(konvaSticker);
                addShapeEvents(konvaSticker);
                tr.nodes([konvaSticker]);
                tr.getLayer().batchDraw();
                layer.draw();
                stickersPanel.style.display = 'none';
            };
        });
    });

    document.getElementById('reset-canvas').addEventListener('click', function () {
        console.log('Canvas reset');
        
        // Remove all elements from the layer including transformer
        layer.destroyChildren();
        
        // Recreate the background image
        backgroundImage = new Konva.Image({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
        });
        layer.add(backgroundImage);
        
        // Recreate the transparent rectangle
        transparentRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fill: 'transparent',
        });
        layer.add(transparentRect);
        
        // Completely recreate the transformer to ensure it's fresh
        tr.destroy();
        tr = new Konva.Transformer({
            anchorSize: 20,
            padding: 5,
        });
        layer.add(tr);
        
        // Reattach the click event listener to the transparent rectangle
        transparentRect.on('mousedown touchstart', function (e) {
            console.log('Transparent Rect clicked/touched');
            if (e.target === transparentRect) {
                resetTransformer();
                layer.draw();
            }
        });

        // Clear file input
        fileInput.value = ''; 

        // Redraw the layer to reflect the changes
        layer.draw();
    });

    document.getElementById('download-meme').addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Download meme triggered');
        const previousNodes = tr.nodes();
        tr.nodes([]);
        layer.draw();

        setTimeout(() => {
            try {
                const dataURL = stage.toDataURL({ pixelRatio: 2 });
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = 'meme.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Meme downloaded');
            } catch (err) {
                console.error('Error saving meme:', err);
                alert('Export failed. Please try another browser or disable Brave Shields.');
            }
            tr.nodes(previousNodes);
            layer.draw();
        }, 100);
    });

    document.getElementById('remove-selected').addEventListener('click', function () {
        const selectedNode = tr.nodes()[0];
        if (selectedNode) {
            console.log('Selected node removed');
            selectedNode.destroy();
            resetTransformer();
            layer.draw();
        }
    });

    const previewStage = new Konva.Stage({
        container: 'text-preview',
        width: 300,
        height: 100,
    });
    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    function updatePreview() {
        console.log('Text preview updated');
        previewLayer.destroyChildren();

        const previewText = new Konva.Text({
            text: document.getElementById('new-meme-text').value,
            fontSize: 50,
            fontFamily: document.getElementById('font-select').value,
            fill: document.getElementById('color-picker').value,
            stroke: document.getElementById('stroke-color-picker').value,
            strokeWidth: document.getElementById('stroke-width-slider').value,
        });

        previewLayer.add(previewText);
        previewText.x((previewStage.width() - previewText.width()) / 2);
        previewText.y((previewStage.height() - previewText.height()) / 2);
        previewLayer.draw();
    }

    document.getElementById('new-meme-text').addEventListener('input', updatePreview);
    document.getElementById('font-select').addEventListener('change', updatePreview);
    document.getElementById('color-picker').addEventListener('change', updatePreview);
    document.getElementById('stroke-color-picker').addEventListener('change', updatePreview);
    document.getElementById('stroke-width-slider').addEventListener('input', updatePreview);
});

function resizeStage() {
    const containerWidth = stageContainer.offsetWidth;
    stage.width(containerWidth);
    stage.height(containerWidth);

    // Resize background image
    if (backgroundImage.image()) {
        const imageWidth = backgroundImage.image().width;
        const imageHeight = backgroundImage.image().height;
        const scale = Math.max(containerWidth / imageWidth, containerWidth / imageHeight);
        
        backgroundImage.width(imageWidth * scale);
        backgroundImage.height(imageHeight * scale);
        backgroundImage.x((containerWidth - imageWidth * scale) / 2);
        backgroundImage.y((containerWidth - imageHeight * scale) / 2);
    }

    // Resize transparent rectangle
    transparentRect.width(containerWidth);
    transparentRect.height(containerWidth);

    // Resize and reposition all stickers
    layer.children.forEach(function(child) {
        if (child instanceof Konva.Image && child !== backgroundImage) {
            const oldScale = child.scaleX();
            const newScale = (containerWidth / stage.width()) * oldScale;
            child.scale({ x: newScale, y: newScale });
            
            // Adjust position proportionally
            const newX = (child.x() * containerWidth) / stage.width();
            const newY = (child.y() * containerWidth) / stage.height();
            child.position({ x: newX, y: newY });
        }
    });

    layer.batchDraw();
}

window.addEventListener('resize', resizeStage);

// Prevent default touch behavior to avoid scrolling issues
stage.content.addEventListener('touchstart', function (e) {
    e.preventDefault();
}, { passive: false });

// Add this function at the end of your file, outside the DOMContentLoaded event listener
function addPinchZoomToShape(shape) {
    let lastDist = 0;
    let startScale = 1;

    shape.on('touchstart', function(e) {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
            lastDist = getDistance(touch1, touch2);
            startScale = shape.scaleX();
        }
    });

    shape.on('touchmove', function(e) {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
            e.evt.preventDefault();
            e.evt.stopPropagation();

            const dist = getDistance(touch1, touch2);
            const scale = (startScale * dist) / lastDist;

            shape.scaleX(scale);
            shape.scaleY(scale);

            shape.getLayer().batchDraw();
        }
    });

    shape.on('touchend', function() {
        lastDist = 0;
    });

    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
    }
}
