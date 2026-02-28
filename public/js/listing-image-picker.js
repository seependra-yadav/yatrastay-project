(() => {
    "use strict";

    const pickerBlocks = document.querySelectorAll("[data-image-picker]");
    if (!pickerBlocks.length) return;

    pickerBlocks.forEach((block) => {
        const input = block.querySelector('input[type="file"][name="listing[images]"]');
        const previewRoot = block.querySelector("[data-selected-preview]");
        const summaryNode = block.querySelector("[data-selected-summary]");

        if (!input || !previewRoot || !summaryNode) return;

        const maxFiles = Number(block.dataset.maxFiles) || 10;
        const maxSizeMb = Number(block.dataset.maxSizeMb) || 10;
        const maxFileSizeBytes = maxSizeMb * 1024 * 1024;
        const selectedFiles = [];

        const fileKey = (file) =>
            [file.name, file.size, file.type, file.lastModified].join("|");

        const syncInputFiles = () => {
            const transfer = new DataTransfer();
            selectedFiles.forEach((file) => transfer.items.add(file));
            input.files = transfer.files;
        };

        const renderSummary = (rejections = []) => {
            const pieces = [`Selected ${selectedFiles.length}/${maxFiles} image(s).`];
            if (rejections.length) pieces.push(rejections.join(" "));
            summaryNode.textContent = pieces.join(" ");
        };

        const renderPreview = () => {
            previewRoot.innerHTML = "";

            selectedFiles.forEach((file, index) => {
                const item = document.createElement("div");
                item.className = "selected-upload-item";

                const img = document.createElement("img");
                img.alt = `Selected image ${index + 1}`;
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "selected-upload-remove";
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", () => {
                    selectedFiles.splice(index, 1);
                    syncInputFiles();
                    renderPreview();
                    renderSummary();
                });

                item.appendChild(img);
                item.appendChild(removeButton);
                previewRoot.appendChild(item);
            });
        };

        input.addEventListener("change", () => {
            const incoming = Array.from(input.files || []);
            const existingKeys = new Set(selectedFiles.map((file) => fileKey(file)));
            const rejections = [];

            incoming.forEach((file) => {
                if (selectedFiles.length >= maxFiles) {
                    rejections.push(`Only ${maxFiles} images are allowed.`);
                    return;
                }
                if (file.size > maxFileSizeBytes) {
                    rejections.push(`${file.name} is larger than ${maxSizeMb} MB.`);
                    return;
                }
                const key = fileKey(file);
                if (existingKeys.has(key)) return;

                selectedFiles.push(file);
                existingKeys.add(key);
            });

            syncInputFiles();
            renderPreview();
            renderSummary(rejections);
        });

        renderSummary();
    });
})();
