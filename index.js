import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";

env.allowLocalModels = false;

const fileUpload = document.getElementById("file-upload");
const imageContainer = document.getElementById("image-container");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");

status.textContent = "Loading model...";

const detector = await pipeline("object-detection", "Xenova/detr-resnet-50");

status.textContent = "Ready";

fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (e2) => {
    imageContainer.innerHTML = "";
    const image = document.createElement("img");
    image.src = e2.target.result;
    imageContainer.appendChild(image);
    detect(image);
  };
  reader.readAsDataURL(file);
});

async function detect(image) {
  status.textContent = "Analysing ...";
  const output = await detector(image.src, {
    threshold: 0.5,
    percentage: true,
  });
  status.textContent = "";
  output.forEach(renderBox);
  const btn = document.createElement("button");
  btn.className = "btn-primary";
  btn.innerHTML = `<img src="https://www.svgrepo.com/show/340918/reset.svg" class="upload-icon" /> Reset`;
  resetBtn.appendChild(btn);
  resetBtn.addEventListener("click", () => {
    location.reload();
  });
}

function renderBox({ box, label }) {
  const { xmax, xmin, ymax, ymin } = box;
  const color =
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, 0);
  console.log(color);
  const boxElement = document.createElement("div");
  boxElement.className = "bounding-box";
  Object.assign(boxElement.style, {
    border: "2px solid",
    borderColor: color,
    left: 100 * xmin + "%",
    top: 100 * ymin + "%",
    width: 100 * (xmax - xmin) + "%",
    height: 100 * (ymax - ymin) + "%",
  });

  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  labelElement.className = "bounding-box-label";
  labelElement.style.backgroundColor = color;

  boxElement.appendChild(labelElement);
  imageContainer.appendChild(boxElement);
}
