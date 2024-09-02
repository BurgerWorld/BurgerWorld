let stage, stageContainer, backgroundImage, layer, tr, transparentRect;

// Move this function to the global scope, outside of any other function
function addShapeEvents(shape) {
    shape.on('mousedown touchstart', function (e) {
        e.cancelBubble = true;
        tr.nodes([shape]);
        layer.batchDraw();
    });

    shape.on('transform', function () {
        updateTransformer(shape);
    });

    shape.on('transformend', function () {
        finalizeTransform(shape);
    });
}

function updateTransformer(shape) {
    // ... existing updateTransformer code ...
}

function finalizeTransform(shape) {
    // ... existing finalizeTransform code ...
}

document.addEventListener('DOMContentLoaded', function () {
    stageContainer = document.getElementById('meme-stage');
    const containerWidth = stageContainer.offsetWidth;

    stage = new Konva.Stage({
        container: 'meme-stage',
        width: containerWidth,
        height: containerWidth,
    });

    stage.content.addEventListener('touchstart', function (e) {
        e.preventDefault();
    }, { passive: false });

    layer = new Konva.Layer();
    stage.add(layer);

    backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
    });
    layer.add(backgroundImage);

    transparentRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: 'transparent',
    });
    layer.add(transparentRect);

    tr = new Konva.Transformer({
        anchorSize: 20,
        padding: 5,
        keepRatio: false,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    });
    layer.add(tr);

    function resetTransformer() {
        tr.nodes([]);
        layer.add(tr);
        tr.moveToTop();
    }

    transparentRect.on('mousedown touchstart', function (e) {
        if (e.target === transparentRect) {
            resetTransformer();
            layer.draw();
        }
    });

    stage.on('mousedown touchstart', function (e) {
        if (e.target === stage) {
            resetTransformer();
            layer.draw();
        }
    });

    stage.on('contentTouchstart', function(e) {
        e.evt.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = tr.nodes()[0];
            if (selectedNode) {
                selectedNode.destroy();
                resetTransformer();
                layer.draw();
            }
        }
    });

    const stickersPanel = document.getElementById('stickers-panel');

    document.getElementById('open-stickers').addEventListener('click', function () {
        hideAllPanels();
        showPanel('stickers-panel');
    });

    document.getElementById('close-stickers').addEventListener('click', function () {
        hidePanel('stickers-panel');
    });

    const fileInput = document.getElementById('upload-image');
    fileInput.addEventListener('change', function (e) {
        const reader = new FileReader();
        reader.onload = function () {
            const imageObj = new Image();
            imageObj.crossOrigin = "Anonymous";
            imageObj.src = reader.result;
            imageObj.onload = function () {
                backgroundImage.image(imageObj);
                resizeStage();
                layer.draw();
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        fileInput.value = '';
    });

    document.getElementById('meme-text').addEventListener('click', function () {
        console.log('Add Text button clicked'); // Add this line for debugging
        hideAllPanels();
        showPanel('text-panel');
    });

    document.getElementById('cancel-text-button').addEventListener('click', function () {
        hidePanel('text-panel');
    });

    document.getElementById('add-text-button').addEventListener('click', function () {
        const text = document.getElementById('new-meme-text').value;
        if (text.trim() !== '') {  // Only add text if it's not empty
            const textGroup = createTextGroup(text, stage.width() / 2, stage.height() / 2);
            layer.add(textGroup);
            tr.nodes([textGroup]);
            layer.batchDraw();  // Use batchDraw instead of draw for better performance

            // Close the text panel
            hidePanel('text-panel');
            
            // Clear the input field
            document.getElementById('new-meme-text').value = '';

            // Trigger resize event to ensure proper layout
            window.dispatchEvent(new Event('resize'));
        }
    });

    document.querySelectorAll('.sticker').forEach(function (sticker) {
        sticker.addEventListener('click', function () {
            const stickerImage = new Image();
            stickerImage.crossOrigin = "Anonymous";
            stickerImage.src = sticker.src;

            stickerImage.onload = function () {
                const stageWidth = stage.width();
                const stageHeight = stage.height();
                
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

                konvaSticker.position({
                    x: (stageWidth - konvaSticker.width()) / 2,
                    y: (stageHeight - konvaSticker.height()) / 2,
                });

                layer.add(konvaSticker);
                addShapeEvents(konvaSticker);
                tr.nodes([konvaSticker]);
                tr.getLayer().batchDraw();
                layer.draw();
                hidePanel('stickers-panel'); // Add this line to close the sticker panel
            };
        });
    });

    document.getElementById('reset-canvas').addEventListener('click', function () {
        layer.destroyChildren();
        
        backgroundImage = new Konva.Image({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
        });
        layer.add(backgroundImage);
        
        transparentRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fill: 'transparent',
        });
        layer.add(transparentRect);
        
        tr.destroy();
        tr = new Konva.Transformer({
            anchorSize: 20,
            padding: 5,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        });
        layer.add(tr);
        
        transparentRect.on('mousedown touchstart', function (e) {
            if (e.target === transparentRect) {
                resetTransformer();
                layer.draw();
            }
        });

        fileInput.value = ''; 
        layer.draw();
    });

    document.getElementById('download-meme').addEventListener('click', function (e) {
        e.preventDefault();
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
            } catch (err) {
                alert('Export failed. Please try another browser or disable Brave Shields.');
            }
            tr.nodes(previousNodes);
            layer.draw();
        }, 100);
    });

    document.getElementById('remove-selected').addEventListener('click', function () {
        const selectedNode = tr.nodes()[0];
        if (selectedNode) {
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

    if (backgroundImage.image()) {
        const imageWidth = backgroundImage.image().width;
        const imageHeight = backgroundImage.image().height;
        const scale = Math.max(containerWidth / imageWidth, containerWidth / imageHeight);
        
        backgroundImage.width(imageWidth * scale);
        backgroundImage.height(imageHeight * scale);
        backgroundImage.x((containerWidth - imageWidth * scale) / 2);
        backgroundImage.y((containerWidth - imageHeight * scale) / 2);
    }

    transparentRect.width(containerWidth);
    transparentRect.height(containerWidth);

    layer.children.forEach(function(child) {
        if (child instanceof Konva.Image && child !== backgroundImage) {
            const oldScale = child.scaleX();
            const newScale = (containerWidth / stage.width()) * oldScale;
            child.scale({ x: newScale, y: newScale });
            
            const newX = (child.x() * containerWidth) / stage.width();
            const newY = (child.y() * containerWidth) / stage.height();
            child.position({ x: newX, y: newY });
        }
    });

    layer.batchDraw();
}

window.addEventListener('resize', resizeStage);

function createTextGroup(text, x, y) {
    const newText = new Konva.Text({
        text: text,
        fontSize: 60,
        fontFamily: document.getElementById('font-select').value,
        fill: document.getElementById('color-picker').value,
        stroke: document.getElementById('stroke-color-picker').value,
        strokeWidth: parseInt(document.getElementById('stroke-width-slider').value, 10),
        padding: 0,
        align: 'center'
    });

    const textWidth = newText.width();
    const textHeight = newText.height();

    const textBackground = new Konva.Rect({
        width: textWidth,
        height: textHeight,
        fill: 'transparent',
    });

    const group = new Konva.Group({
        x: x - textWidth / 2,
        y: y - textHeight / 2,
        width: textWidth,
        height: textHeight,
        draggable: true
    });
    group.add(textBackground, newText);

    addShapeEvents(group);

    return group;
}

function showPanel(panelId) {
    console.log('Showing panel:', panelId); // Add this line for debugging
    document.getElementById(panelId).classList.add('show');
}

function hidePanel(panelId) {
    console.log('Hiding panel:', panelId); // Add this line for debugging
    document.getElementById(panelId).classList.remove('show');
}

function hideAllPanels() {
    console.log('Hiding all panels'); // Add this line for debugging
    hidePanel('text-panel');
    hidePanel('stickers-panel');
}

// Remove these duplicate event listeners if they exist
// document.getElementById('meme-text').addEventListener('click', function() {
//     hideAllPanels();
//     showPanel('text-panel');
// });

// document.getElementById('open-stickers').addEventListener('click', function() {
//     hideAllPanels();
//     showPanel('stickers-panel');
// });

// document.getElementById('close-stickers').addEventListener('click', function() {
//     hidePanel('stickers-panel');
// });

// document.getElementById('cancel-text-button').addEventListener('click', function() {
//     hidePanel('text-panel');
// });

// document.getElementById('add-text-button').addEventListener('click', function() {
//     // Your existing code for adding text
//     // ...

//     hidePanel('text-panel');
// });
