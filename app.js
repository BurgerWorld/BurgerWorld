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

    const transparentRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: 'transparent',
    });
    layer.add(transparentRect);

    const tr = new Konva.Transformer({
        anchorSize: 20,
        padding: 5,
    });
    layer.add(tr);

    transparentRect.on('click', function () {
        tr.nodes([]);
        layer.draw();
    });

    function addShapeEvents(shape) {
        shape.on('click', function (e) {
            e.cancelBubble = true;
            tr.nodes([shape]);
            layer.draw();
        });

        shape.on('transformend dragend', function () {
            layer.batchDraw();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNode = tr.nodes()[0];
            if (selectedNode) {
                selectedNode.destroy();
                tr.nodes([]);
                layer.draw();
            }
        }
    });

    const stickersPanel = document.getElementById('stickers-panel');

    document.getElementById('open-stickers').addEventListener('click', function () {
        stickersPanel.classList.add('show');
        stickersPanel.style.display = 'grid';
    });

    document.getElementById('close-stickers').addEventListener('click', function () {
        stickersPanel.classList.remove('show');
        stickersPanel.style.display = 'none';
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
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        fileInput.value = '';
    });

    document.getElementById('meme-text').addEventListener('click', function () {
        document.getElementById('text-panel').style.display = 'block';
    });

    document.getElementById('cancel-text-button').addEventListener('click', function () {
        document.getElementById('text-panel').style.display = 'none';
    });

    document.getElementById('add-text-button').addEventListener('click', function () {
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

        layer.add(newText);
        addShapeEvents(newText);
        tr.nodes([newText]);
        tr.forceUpdate();
        layer.draw();

        document.getElementById('text-panel').style.display = 'none';
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
                addShapeEvents(konvaSticker);
                tr.nodes([konvaSticker]);
                layer.draw();
                stickersPanel.style.display = 'none';
            };
        });
    });

    document.getElementById('reset-canvas').addEventListener('click', function () {
        layer.removeChildren();
        layer.add(backgroundImage);
        layer.add(tr);
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
                console.error('Error saving meme:', err);
            }
            tr.nodes(previousNodes);
            layer.draw();
        }, 100);
    });

    document.getElementById('remove-selected').addEventListener('click', function () {
        const selectedNode = tr.nodes()[0];
        if (selectedNode) {
            selectedNode.destroy();
            tr.nodes([]);
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
