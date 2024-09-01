document.addEventListener('DOMContentLoaded', function () {
    const stage = new Konva.Stage({
        container: 'meme-stage',
        width: 500,
        height: 500,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    let backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
    });
    layer.add(backgroundImage);

    // Add a transparent rectangle that covers the entire stage
    const transparentRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: 'transparent',
    });
    layer.add(transparentRect);

    const tr = new Konva.Transformer({
        anchorSize: 20,  // Increase the size of the anchor nodes (default is 10)
        padding: 5,     // Add padding around the transformable object
    });
    layer.add(tr);

    // Deselect all objects when clicking on the transparent rectangle (stage background)
    transparentRect.on('click', function () {
        console.log("Stage clicked"); // Debugging stage clicks
        tr.nodes([]);
        layer.draw();
        console.log("Transformer cleared"); // Debugging transformer state
    });

    // Function to add click event handler to shapes
    function addShapeEvents(shape) {
        shape.on('click', function (e) {
            console.log("Shape clicked:", shape); // Debugging shape clicks
            e.cancelBubble = true; // Prevent event from reaching the stage click listener
            tr.nodes([shape]);
            layer.draw();
            console.log("Transformer attached to shape:", tr.nodes()); // Debugging transformer nodes
        });

        // Update transformer on drag or transform
        shape.on('transformend dragend', function () {
            layer.batchDraw();
            console.log("Transform or drag ended"); // Debugging transform/drag end
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = tr.nodes()[0];
            if (selectedNode) {
                selectedNode.destroy();
                tr.nodes([]);
                layer.draw();
                console.log("Node deleted"); // Debugging node deletion
            }
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        const stickersPanel = document.getElementById('stickers-panel');
        
        document.getElementById('open-stickers').addEventListener('click', function () {
            stickersPanel.classList.add('show'); // Add 'show' class to make stickers larger and display in grid
            stickersPanel.style.display = 'grid';  // Ensure grid layout is applied
        });
    
        document.getElementById('close-stickers').addEventListener('click', function () {
            stickersPanel.classList.remove('show'); // Remove 'show' class when closing
            stickersPanel.style.display = 'none';
        });
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
                layer.draw();
                console.log("Background image updated"); // Debugging background image update
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        fileInput.value = '';
    });

    const textPanel = document.getElementById('text-panel');
    const newTextInput = document.getElementById('new-meme-text');
    const fontSelect = document.getElementById('font-select');
    const colorPicker = document.getElementById('color-picker');
    const strokeColorPicker = document.getElementById('stroke-color-picker');
    const strokeWidthSlider = document.getElementById('stroke-width-slider');

    document.getElementById('meme-text').addEventListener('click', function () {
        textPanel.style.display = 'block';
    });

    document.getElementById('cancel-text-button').addEventListener('click', function () {
        textPanel.style.display = 'none';
    });

    document.getElementById('add-text-button').addEventListener('click', function () {
        const strokeColor = strokeColorPicker.value;
        const strokeWidth = parseInt(strokeWidthSlider.value, 10);

        const newText = new Konva.Text({
            x: 50,
            y: 50,
            text: newTextInput.value,
            fontSize: 60,
            fontFamily: fontSelect.value,
            fill: colorPicker.value,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            draggable: true,
        });

        layer.add(newText);
        addShapeEvents(newText); // Attach the click handler to the new text

        tr.nodes([newText]);
        tr.forceUpdate();
        layer.draw();

        textPanel.style.display = 'none';
        console.log("Text added and transformer attached:", tr.nodes()); // Debugging transformer state after adding text
    });

    const stickersPanel = document.getElementById('stickers-panel');
    document.getElementById('open-stickers').addEventListener('click', function () {
        stickersPanel.style.display = 'block';
    });

    document.getElementById('close-stickers').addEventListener('click', function () {
        stickersPanel.style.display = 'none';
    });

    document.querySelectorAll('.sticker').forEach(function (sticker) {
        sticker.addEventListener('click', function () {
            const stickerImage = new Image();
            stickerImage.crossOrigin = "Anonymous";
            stickerImage.src = sticker.src;

            stickerImage.onload = function () {
                const konvaSticker = new Konva.Image({
                    x: 50,
                    y: 50,
                    image: stickerImage,
                    draggable: true,
                });

                layer.add(konvaSticker);
                addShapeEvents(konvaSticker); // Attach the click handler to the new sticker

                tr.nodes([konvaSticker]);
                layer.draw();
                stickersPanel.style.display = 'none';
                console.log("Sticker added and transformer attached:", tr.nodes()); // Debugging transformer state after adding sticker
            };
        });
    });

    document.getElementById('reset-canvas').addEventListener('click', function () {
        layer.removeChildren();

        backgroundImage = new Konva.Image({
            x: 0,
            y: 0,
            width: 500,
            height: 500,
        });
        layer.add(backgroundImage);

        tr.nodes([]);
        layer.add(tr);

        fileInput.value = '';

        layer.draw();
        console.log("Canvas reset and transformer cleared"); // Debugging canvas reset
    });

    document.getElementById('download-meme').addEventListener('click', function (e) {
        e.preventDefault();

        // Temporarily remove the transformer nodes to hide the transform boxes
        const previousNodes = tr.nodes();
        tr.nodes([]);
        layer.draw();  // Redraw the layer to hide the transformer

        setTimeout(() => {
            try {
                const dataURL = stage.toDataURL({ pixelRatio: 2 });
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = 'meme.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log("Meme downloaded"); // Debugging meme download
            } catch (err) {
                console.error('Error saving meme:', err);
            }

            // Restore the transformer nodes after saving the image
            tr.nodes(previousNodes);
            layer.draw();  // Redraw the layer to show the transformer again
        }, 100);
    });

    document.getElementById('remove-selected').addEventListener('click', function () {
        const selectedNode = tr.nodes()[0];
        if (selectedNode) {
            selectedNode.destroy();
            tr.nodes([]);
            layer.draw();
            console.log("Selected node removed"); // Debugging node removal
        }
    });

    // Text preview
    const previewStage = new Konva.Stage({
        container: 'text-preview',
        width: 300,
        height: 100,
    });
    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    document.getElementById('new-meme-text').addEventListener('input', updatePreview);
    document.getElementById('font-select').addEventListener('change', updatePreview);
    document.getElementById('color-picker').addEventListener('change', updatePreview);
    document.getElementById('stroke-color-picker').addEventListener('change', updatePreview);
    document.getElementById('stroke-width-slider').addEventListener('input', updatePreview);

    function updatePreview() {
        previewLayer.destroyChildren();

        const previewText = new Konva.Text({
            text: newTextInput.value,
            fontSize: 50,
            fontFamily: fontSelect.value,
            fill: colorPicker.value,
            stroke: strokeColorPicker.value,
            strokeWidth: strokeWidthSlider.value,
        });

        previewLayer.add(previewText);

        previewText.x((previewStage.width() - previewText.width()) / 2);
        previewText.y((previewStage.height() - previewText.height()) / 2);

        previewLayer.draw();
        console.log("Preview updated"); // Debugging text preview updates
    }
});
