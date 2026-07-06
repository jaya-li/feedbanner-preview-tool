const themes = [
  {
    id: "red",
    name: "Red",
    className: "theme-red",
    baseSrc: "./assets/figma-bases/red.png",
    figmaNode: "0:1206",
    bgStart: "#220006",
    bgMid: "#000000",
    bgEnd: "#36000A",
    panel: "rgba(255,255,255,0.12)",
    cta: "#fe2c55",
    accent: "#fe2c55",
    shadow: "rgba(255,49,95,0.35)",
  },
  {
    id: "orange",
    name: "Orange",
    className: "theme-orange",
    baseSrc: "./assets/figma-bases/orange.png",
    figmaNode: "0:1293",
    bgStart: "#220A00",
    bgMid: "#000000",
    bgEnd: "#4D1600",
    panel: "rgba(255,160,86,0.16)",
    cta: "#ff5e1c",
    accent: "#ff5e1c",
    shadow: "rgba(255,106,32,0.34)",
  },
  {
    id: "yellow",
    name: "Yellow",
    className: "theme-yellow",
    baseSrc: "./assets/figma-bases/yellow.png",
    figmaNode: "0:1380",
    bgStart: "#221B00",
    bgMid: "#000000",
    bgEnd: "#403200",
    panel: "rgba(255,218,79,0.15)",
    cta: "#ffd63c",
    accent: "#ffd63c",
    shadow: "rgba(255,209,43,0.32)",
  },
  {
    id: "green",
    name: "Green",
    className: "theme-green",
    baseSrc: "./assets/figma-bases/green.png",
    figmaNode: "0:551",
    bgStart: "#1A2200",
    bgMid: "#000000",
    bgEnd: "#304000",
    panel: "rgba(128,230,28,0.14)",
    cta: "#afea00",
    accent: "#afea00",
    shadow: "rgba(123,224,0,0.32)",
  },
  {
    id: "cyan",
    name: "Cyan",
    className: "theme-cyan",
    baseSrc: "./assets/figma-bases/cyan.png",
    figmaNode: "0:661",
    bgStart: "#002022",
    bgMid: "#000000",
    bgEnd: "#003C40",
    panel: "rgba(34,197,210,0.14)",
    cta: "#22c7d4",
    accent: "#22c7d4",
    shadow: "rgba(18,168,181,0.34)",
  },
  {
    id: "blue",
    name: "Blue",
    className: "theme-blue",
    baseSrc: "./assets/figma-bases/blue.png",
    figmaNode: "0:772",
    bgStart: "#00253B",
    bgMid: "#000000",
    bgEnd: "#00253B",
    panel: "rgba(55,139,255,0.15)",
    cta: "#2479e8",
    accent: "#2479e8",
    shadow: "rgba(20,123,255,0.34)",
  },
  {
    id: "purple",
    name: "Purple",
    className: "theme-purple",
    baseSrc: "./assets/figma-bases/purple.png",
    figmaNode: "0:882",
    bgStart: "#060022",
    bgMid: "#000000",
    bgEnd: "#0E004D",
    panel: "rgba(139,105,255,0.16)",
    cta: "#6b4cf6",
    accent: "#6b4cf6",
    shadow: "rgba(107,84,255,0.34)",
  },
];

const PREVIEW_WIDTH = 390;
const PREVIEW_HEIGHT = 844;
const EXPORT_SCALE = 3;

themes.forEach((theme) => {
  theme.fileSrc = theme.baseSrc;
  theme.baseSrc = window.FIGMA_BASE_DATA?.[theme.id] || theme.baseSrc;
});

const state = {
  theme: themes[0],
  fit: "contain",
  scale: 1,
  x: 0,
  y: 0,
  assetType: null,
  assetUrl: null,
  downloadUrl: null,
  batchAssets: [],
  batchThumbUrls: [],
  currentAssetIndex: -1,
};

const themeBaseImages = new Map();

const els = {
  phone: document.querySelector("#phone"),
  phoneStage: document.querySelector(".phone-stage"),
  figmaBase: document.querySelector("#figmaBase"),
  heroSlot: document.querySelector("#heroSlot"),
  image: document.querySelector("#assetImage"),
  video: document.querySelector("#assetVideo"),
  videoCanvas: document.querySelector("#assetVideoCanvas"),
  emptyState: document.querySelector("#emptyState"),
  input: document.querySelector("#assetInput"),
  fileName: document.querySelector("#fileName"),
  assetListBlock: document.querySelector("#assetListBlock"),
  assetList: document.querySelector("#assetList"),
  assetListCount: document.querySelector("#assetListCount"),
  themeGrid: document.querySelector("#themeGrid"),
  themeName: document.querySelector("#themeName"),
  scaleRange: document.querySelector("#scaleRange"),
  scaleValue: document.querySelector("#scaleValue"),
  xRange: document.querySelector("#xRange"),
  yRange: document.querySelector("#yRange"),
  guideToggle: document.querySelector("#guideToggle"),
  downloadBtn: document.querySelector("#downloadBtn"),
  downloadLabel: document.querySelector("#downloadLabel"),
  manualDownloadLink: document.querySelector("#manualDownloadLink"),
  downloadStatus: document.querySelector("#downloadStatus"),
  batchDownloadBtn: document.querySelector("#batchDownloadBtn"),
  batchCount: document.querySelector("#batchCount"),
  batchProgress: document.querySelector("#batchProgress"),
  batchStatus: document.querySelector("#batchStatus"),
  fitButtons: [...document.querySelectorAll("[data-fit]")],
};

let videoFrameRequest = 0;

function initThemes() {
  themes.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-swatch${theme.id === state.theme.id ? " active" : ""}`;
    button.style.setProperty("--swatch", `url("${theme.baseSrc}") center / cover`);
    button.style.setProperty("--cta", theme.cta);
    button.setAttribute("aria-label", theme.name);
    button.title = theme.name;
    button.addEventListener("click", () => setTheme(theme.id));
    els.themeGrid.appendChild(button);
  });
}

function setTheme(id) {
  const next = themes.find((theme) => theme.id === id) || themes[0];
  state.theme = next;
  els.phone.className = `phone ${next.className}`;
  els.figmaBase.src = next.baseSrc;
  els.themeName.textContent = next.name;
  [...els.themeGrid.children].forEach((button, index) => {
    button.classList.toggle("active", themes[index].id === id);
  });
  if (state.batchAssets.length) {
    updateBatchUi(`已载入 ${state.batchAssets.length} 个素材，将使用当前 ${next.name} 配色批量下载`, 1, 1);
  }
}

function setFit(fit) {
  state.fit = fit;
  els.fitButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.fit === fit);
  });
  els.heroSlot.classList.toggle("asset-cover", fit === "cover");
  els.heroSlot.classList.toggle("asset-contain", fit === "contain");
  if (state.assetType === "video" && els.video.videoWidth && els.video.videoHeight) {
    updateVideoCanvasSize(els.video.videoWidth, els.video.videoHeight);
  }
}

function syncPlacement() {
  state.scale = Number(els.scaleRange.value) / 100;
  state.x = Number(els.xRange.value);
  state.y = Number(els.yRange.value);
  els.heroSlot.style.setProperty("--asset-scale", state.scale);
  els.heroSlot.style.setProperty("--asset-x", `${state.x}px`);
  els.heroSlot.style.setProperty("--asset-y", `${state.y}px`);
  els.scaleValue.textContent = `${Math.round(state.scale * 100)}%`;
}

function setAsset(file) {
  if (!file) return;
  if (state.assetUrl) URL.revokeObjectURL(state.assetUrl);
  stopVideoAlphaRenderer();

  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");
  state.assetUrl = url;
  state.assetType = isVideo ? "video" : "image";
  els.downloadLabel.textContent = "下载效果包 ZIP";

  els.fileName.textContent = file.name;
  els.heroSlot.classList.add("has-asset");
  els.image.classList.remove("active");
  els.video.classList.remove("active");
  els.videoCanvas.classList.remove("active");
  els.video.pause();
  els.video.removeAttribute("src");
  els.image.removeAttribute("src");

  if (isVideo) {
    els.video.controls = false;
    els.video.disablePictureInPicture = true;
    els.video.controlsList = "nodownload nofullscreen noremoteplayback";
    els.video.src = url;
    els.video.load();
    els.video.onloadeddata = () => {
      startVideoAlphaRenderer();
      els.video.play().catch(() => {
        updateDownloadStatus("视频已载入，点击预览区可开始播放");
      });
    };
  } else {
    els.image.src = url;
    els.image.classList.add("active");
  }
}

async function handleAssetInput(file) {
  if (!file) return;
  if (isZipFile(file)) {
    await loadBatchZip(file);
    return;
  }
  clearBatch();
  setAsset(file);
}

function isZipFile(file) {
  return file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip";
}

function isRenderableName(name) {
  return /\.(png|webp|gif|jpg|jpeg|avif|webm|mov|mp4)$/i.test(name);
}

function isSystemZipEntry(name) {
  const parts = name.split("/");
  const fileName = parts.at(-1) || "";
  return parts.includes("__MACOSX") || fileName.startsWith("._") || fileName === ".DS_Store";
}

function mimeFromName(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}

function cleanFileName(name) {
  return name
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "asset";
}

function uniqueZipPath(path, usedPaths) {
  if (!usedPaths.has(path)) {
    usedPaths.add(path);
    return path;
  }
  const dotIndex = path.lastIndexOf(".");
  const base = dotIndex > -1 ? path.slice(0, dotIndex) : path;
  const ext = dotIndex > -1 ? path.slice(dotIndex) : "";
  let index = 2;
  let nextPath = `${base}-${index}${ext}`;
  while (usedPaths.has(nextPath)) {
    index += 1;
    nextPath = `${base}-${index}${ext}`;
  }
  usedPaths.add(nextPath);
  return nextPath;
}

function clearBatch() {
  state.batchThumbUrls.forEach((url) => URL.revokeObjectURL(url));
  state.batchAssets = [];
  state.batchThumbUrls = [];
  state.currentAssetIndex = -1;
  els.assetList.innerHTML = "";
  els.assetListBlock.hidden = true;
  els.assetListCount.textContent = "0 个";
  updateBatchUi("上传 ZIP 后可批量下载", 0, 1);
  els.batchCount.textContent = "0 个素材";
  els.batchDownloadBtn.disabled = true;
}

function renderAssetList() {
  state.batchThumbUrls.forEach((url) => URL.revokeObjectURL(url));
  state.batchThumbUrls = [];
  els.assetList.innerHTML = "";
  els.assetListBlock.hidden = state.batchAssets.length === 0;
  els.assetListCount.textContent = `${state.batchAssets.length} 个`;

  state.batchAssets.forEach((file, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `asset-item${index === state.currentAssetIndex ? " active" : ""}`;
    item.title = file.name;
    item.addEventListener("click", () => selectBatchAsset(index));

    const thumb = document.createElement("span");
    thumb.className = "asset-thumb";
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      state.batchThumbUrls.push(url);
      img.src = url;
      img.alt = "";
      thumb.appendChild(img);
    } else {
      const label = document.createElement("span");
      label.textContent = "VIDEO";
      thumb.appendChild(label);
    }

    const name = document.createElement("span");
    name.className = "asset-name";
    name.textContent = cleanFileName(file.name);
    item.append(thumb, name);
    els.assetList.appendChild(item);
  });
}

function selectBatchAsset(index) {
  const file = state.batchAssets[index];
  if (!file) return;
  state.currentAssetIndex = index;
  setAsset(file);
  els.fileName.textContent = `${index + 1}/${state.batchAssets.length} · ${file.name}`;
  [...els.assetList.children].forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === index);
  });
}

function updateBatchUi(message, value = 0, max = 1) {
  els.batchStatus.textContent = message;
  els.batchProgress.max = max;
  els.batchProgress.value = value;
}

function updateDownloadStatus(message) {
  els.downloadStatus.textContent = message;
}

function updatePreviewScale() {
  if (window.innerWidth <= 900) {
    document.documentElement.style.setProperty("--phone-scale", "1");
    return;
  }
  const stageWidth = Math.max(0, els.phoneStage.clientWidth - 24);
  const stageHeight = Math.max(0, els.phoneStage.clientHeight - 24);
  const scale = Math.min(1, stageWidth / 390, stageHeight / 844);
  document.documentElement.style.setProperty("--phone-scale", scale.toFixed(4));
}

function startVideoAlphaRenderer() {
  const sourceWidth = els.video.videoWidth || 390;
  const sourceHeight = els.video.videoHeight || 330;
  const splitAlpha = isSplitAlphaVideo(sourceWidth, sourceHeight);
  const width = splitAlpha ? Math.floor(sourceWidth / 2) : sourceWidth;
  const height = sourceHeight;
  els.videoCanvas.width = width;
  els.videoCanvas.height = height;
  els.videoCanvas.classList.add("active");
  updateDownloadStatus(splitAlpha ? "已识别左右 alpha video，仅展示右侧彩色画面" : "");
  updateVideoCanvasSize(width, height);

  const ctx = els.videoCanvas.getContext("2d", { willReadFrequently: true });
  const render = () => {
    if (state.assetType !== "video" || !els.videoCanvas.classList.contains("active")) return;
    if (els.video.readyState >= 2 && width && height) {
      ctx.clearRect(0, 0, width, height);
      if (splitAlpha) {
        drawSplitAlphaFrame(ctx, els.video, sourceWidth, sourceHeight);
      } else {
        ctx.drawImage(els.video, 0, 0, width, height);
        keyBlackToAlpha(ctx, width, height);
      }
    }
    videoFrameRequest = requestAnimationFrame(render);
  };

  cancelAnimationFrame(videoFrameRequest);
  render();
}

function stopVideoAlphaRenderer() {
  cancelAnimationFrame(videoFrameRequest);
  videoFrameRequest = 0;
  els.videoCanvas.classList.remove("active");
  const ctx = els.videoCanvas.getContext("2d");
  ctx.clearRect(0, 0, els.videoCanvas.width || 1, els.videoCanvas.height || 1);
}

function updateVideoCanvasSize(width, height) {
  const slotRatio = 390 / 330;
  const assetRatio = width / height;
  if (state.fit === "cover") {
    els.videoCanvas.style.width = "100%";
    els.videoCanvas.style.height = "100%";
    return;
  }
  if (assetRatio > slotRatio) {
    els.videoCanvas.style.width = "100%";
    els.videoCanvas.style.height = "auto";
  } else {
    els.videoCanvas.style.width = "auto";
    els.videoCanvas.style.height = "100%";
  }
}

function keyBlackToAlpha(ctx, width, height) {
  const frame = ctx.getImageData(0, 0, width, height);
  const pixels = frame.data;
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    if (max < 28 && max - min < 14) {
      pixels[index + 3] = 0;
    } else if (max < 54 && max - min < 18) {
      pixels[index + 3] = Math.round(pixels[index + 3] * ((max - 28) / 26));
    }
  }
  ctx.putImageData(frame, 0, 0);
}

function isSplitAlphaVideo(width, height) {
  return width / height > 1.6;
}

function drawSplitAlphaFrame(ctx, source, sourceWidth, sourceHeight) {
  const outputWidth = Math.floor(sourceWidth / 2);
  const outputHeight = sourceHeight;
  const scratch = drawSplitAlphaFrame.scratch || (drawSplitAlphaFrame.scratch = document.createElement("canvas"));
  scratch.width = sourceWidth;
  scratch.height = sourceHeight;
  const scratchCtx = scratch.getContext("2d", { willReadFrequently: true });
  scratchCtx.clearRect(0, 0, sourceWidth, sourceHeight);
  scratchCtx.drawImage(source, 0, 0, sourceWidth, sourceHeight);

  const alphaFrame = scratchCtx.getImageData(0, 0, outputWidth, outputHeight);
  const colorFrame = scratchCtx.getImageData(outputWidth, 0, outputWidth, outputHeight);
  const alphaPixels = alphaFrame.data;
  const colorPixels = colorFrame.data;

  for (let index = 0; index < colorPixels.length; index += 4) {
    const matte = Math.max(alphaPixels[index], alphaPixels[index + 1], alphaPixels[index + 2]);
    colorPixels[index + 3] = matte;
  }

  ctx.putImageData(colorFrame, 0, 0);
}

async function loadBatchZip(file) {
  updateBatchUi("正在读取 ZIP...", 0, 1);
  els.batchDownloadBtn.disabled = true;

  try {
    const entries = await readZipFiles(await file.arrayBuffer());
    const assets = entries
      .filter((entry) => !isSystemZipEntry(entry.name) && isRenderableName(entry.name))
      .map((entry) => new File([entry.data], entry.name, { type: mimeFromName(entry.name) }));

    state.batchAssets = assets;
    state.currentAssetIndex = assets.length ? 0 : -1;
    els.batchCount.textContent = `${assets.length} 个素材`;
    els.batchDownloadBtn.disabled = assets.length === 0;
    renderAssetList();
    updateBatchUi(
      assets.length
        ? `已载入 ${assets.length} 个素材，将使用当前 ${state.theme.name} 配色批量下载`
        : "ZIP 中没有找到可用图片或视频",
      1,
      1,
    );

    if (assets[0]) selectBatchAsset(0);
    else els.fileName.textContent = `${file.name} · ${assets.length} 个素材`;
  } catch (error) {
    clearBatch();
    updateBatchUi(`ZIP 读取失败：${error.message}`, 0, 1);
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  lines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * lineHeight);
  });
}

function drawPhoneChrome(ctx, theme) {
  ctx.fillStyle = "#fff";
  ctx.font = "700 15px Arial";
  ctx.fillText("8:00", 38, 30);

  ctx.fillRect(322, 25, 3, 7);
  ctx.fillRect(327, 22, 3, 10);
  ctx.fillRect(332, 19, 3, 13);
  ctx.beginPath();
  ctx.arc(349, 28, 8, Math.PI * 1.12, Math.PI * 1.88);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeRect(365, 21, 19, 10);
  ctx.fillRect(367, 23, 14, 6);

  ctx.font = "700 15px Arial";
  ctx.fillText("For You", 246, 75);
  ctx.beginPath();
  ctx.arc(363, 71, 8, 0, Math.PI * 2);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(369, 77);
  ctx.lineTo(377, 85);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.92)";
  ctx.fillRect(0, 761, 390, 49);
  ctx.fillStyle = "#fff";
  ctx.font = "10px Arial";
  ["Home", "Friends", "", "Inbox", "Me"].forEach((label, index) => {
    if (label) ctx.fillText(label, 78 * index + 25, 800);
  });
  roundedRect(ctx, 177, 774, 36, 28, 8);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#101828";
  ctx.font = "800 25px Arial";
  ctx.fillText("+", 188, 796);
  ctx.fillStyle = theme.cta;
  ctx.fillRect(207, 778, 3, 20);

  roundedRect(ctx, 128, 824, 134, 5, 999);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function drawBackground(ctx, theme) {
  const gradient = createFigmaBackgroundGradient(ctx, 390, 844, theme);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 390, 844);
}

function createFigmaBackgroundGradient(ctx, width, height, theme) {
  const angle = (144.35284658692044 * Math.PI) / 180;
  const direction = {
    x: Math.sin(angle),
    y: -Math.cos(angle),
  };
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  ];
  const projections = corners.map((point) => point.x * direction.x + point.y * direction.y);
  const min = Math.min(...projections);
  const max = Math.max(...projections);
  const center = {
    x: width / 2,
    y: height / 2,
  };
  const length = max - min;
  const gradient = ctx.createLinearGradient(
    center.x - (direction.x * length) / 2,
    center.y - (direction.y * length) / 2,
    center.x + (direction.x * length) / 2,
    center.y + (direction.y * length) / 2,
  );
  gradient.addColorStop(0, theme.bgStart);
  gradient.addColorStop(0.065618, theme.bgStart);
  gradient.addColorStop(0.52789, theme.bgMid);
  gradient.addColorStop(1, theme.bgEnd);
  return gradient;
}

function drawAssetSource(ctx, source, theme, options) {
  if (!source) return;

  const naturalWidth = source.videoWidth || source.naturalWidth || source.width;
  const naturalHeight = source.videoHeight || source.naturalHeight || source.height;
  if (!naturalWidth || !naturalHeight) return;

  const slot = { x: 0, y: 91, width: 390, height: 330 };
  const fitRatio =
    options.fit === "cover"
      ? Math.max(slot.width / naturalWidth, slot.height / naturalHeight)
      : Math.min(slot.width / naturalWidth, slot.height / naturalHeight);
  const drawWidth = naturalWidth * fitRatio * options.scale;
  const drawHeight = naturalHeight * fitRatio * options.scale;
  const drawX = slot.x + (slot.width - drawWidth) / 2 + options.x;
  const drawY = slot.y + (slot.height - drawHeight) / 2 + options.y;

  ctx.save();
  ctx.beginPath();
  ctx.rect(slot.x, slot.y, slot.width, slot.height);
  ctx.clip();
  if (options.shadow) {
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 22;
  }
  ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawAsset(ctx) {
  const source = state.assetType === "video" ? els.video : els.image;
  if (!state.assetType || !source || !source.classList.contains("active")) return;
  drawAssetSource(ctx, source, state.theme, {
    fit: state.fit,
    scale: state.scale,
    x: state.x,
    y: state.y,
    shadow: false,
  });
}

function drawContent(ctx, theme) {
  const shade = ctx.createLinearGradient(0, 421, 0, 761);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 421, 390, 340);

  ctx.fillStyle = "#fff";
  ctx.font = "800 25px Arial";
  drawText(ctx, "Play Unboxing Quest and get", 30, 444, 330, 28);
  ctx.fillStyle = theme.accent;
  ctx.fillText("4,000円分", 142, 472);

  roundedRect(ctx, 30, 486, 330, 86, 12);
  ctx.fillStyle = theme.panel;
  ctx.fill();

  const coin = ctx.createLinearGradient(54, 501, 94, 550);
  coin.addColorStop(0, "#fff8a8");
  coin.addColorStop(0.45, "#ffc400");
  coin.addColorStop(1, "#ff5f24");
  ctx.beginPath();
  ctx.arc(67, 529, 25, 0, Math.PI * 2);
  ctx.fillStyle = coin;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 22px Arial";
  ctx.fillText("¥", 60, 537);

  ctx.font = "700 16px Arial";
  ctx.fillText("Open boxes", 126, 523);
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "12px Arial";
  ctx.fillText("Get rewarded for each box opened!", 126, 546);

  roundedRect(ctx, 30, 586, 148, 44, 999);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();
  roundedRect(ctx, 188, 586, 148, 44, 999);
  ctx.fillStyle = theme.cta;
  ctx.fill();

  ctx.fillStyle = ctaTextColor(theme);
  ctx.font = "700 14px Arial";
  ctx.fillText("Play now", 235, 613);
  ctx.fillStyle = "#fff";
  ctx.fillText("Not interested", 57, 613);
}

async function downloadPreview() {
  updateDownloadStatus("");
  els.manualDownloadLink.hidden = true;
  try {
    if (!areThemeBasesLoaded()) {
      updateDownloadStatus("Figma 基底加载中，请 1 秒后再点下载");
      ensureThemeBasesLoaded().catch((error) => updateDownloadStatus(error.message));
      return;
    }
    if (state.assetType === "video") {
      await downloadVideoPreviewPackage();
      return;
    }
    const source = els.image;
    const canvas = renderPreviewCanvas(source, state.theme);
    const files = [];
    const usedPaths = new Set();
    files.push({
      path: uniqueZipPath(`feedbanner-preview-${state.theme.id}.png`, usedPaths),
      data: await canvasToBytes(canvas),
    });
    await addThemeDownloadAssets(files, state.theme, usedPaths);
    downloadBlob(createZip(files), `feedbanner-preview-package-${state.theme.id}.zip`);
    updateDownloadStatus("已生成效果包 ZIP");
  } catch (error) {
    updateDownloadStatus(`下载失败：${error.message}`);
  }
}

function renderPreviewCanvas(source, theme, options = {}) {
  const renderScale = options.exportScale ?? EXPORT_SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = PREVIEW_WIDTH * renderScale;
  canvas.height = PREVIEW_HEIGHT * renderScale;
  const ctx = canvas.getContext("2d");
  ctx.scale(renderScale, renderScale);
  drawPreviewFrame(ctx, source, theme, options);
  return canvas;
}

function drawPreviewFrame(ctx, source, theme, options = {}) {
  ctx.clearRect(0, 0, 390, 844);
  ctx.save();
  roundedRect(ctx, 0, 0, 390, 844, 30);
  ctx.clip();
  const baseImage = getThemeBaseImage(theme);
  if (baseImage) ctx.drawImage(baseImage, 0, 0, 390, 844);
  else drawBackground(ctx, theme);
  drawAssetSource(ctx, source, theme, {
    fit: state.fit,
    scale: state.scale,
    x: state.x,
    y: state.y,
    shadow: options.shadow ?? false,
  });
  ctx.restore();
  drawPhoneEdgeMask(ctx);
}

function drawPhoneEdgeMask(ctx) {
  ctx.save();
  roundedRect(ctx, 3, 3, 384, 838, 27);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.94)";
  ctx.stroke();
  ctx.restore();
}

async function downloadVideoPreviewPackage() {
  if (!("MediaRecorder" in window) || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error("当前浏览器不支持视频导出，请使用新版 Chrome");
  }
  if (!els.videoCanvas.classList.contains("active")) {
    throw new Error("视频画面还没准备好，请等预览播放后再下载");
  }

  updateDownloadStatus("正在录制 alpha video 预览...");
  const canvas = document.createElement("canvas");
  canvas.width = PREVIEW_WIDTH * EXPORT_SCALE;
  canvas.height = PREVIEW_HEIGHT * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  const stream = canvas.captureStream(30);
  const mimeType = preferredMp4MimeType();
  if (!mimeType) throw new Error("当前浏览器不支持 MP4 视频导出，请使用支持 MP4 MediaRecorder 的新版 Chrome 或 Safari");
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  let frameRequest = 0;
  let stopped = false;

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const stopPromise = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = () => reject(new Error("视频录制失败"));
  });

  const previousLoop = els.video.loop;
  const previousTime = els.video.currentTime || 0;
  const wasPaused = els.video.paused;
  const duration = Number.isFinite(els.video.duration) && els.video.duration > 0 ? els.video.duration : 3;

  const drawLoop = () => {
    drawPreviewFrame(ctx, els.videoCanvas, state.theme, { shadow: false });
    if (!stopped) frameRequest = requestAnimationFrame(drawLoop);
  };

  try {
    els.video.loop = false;
    await seekVideo(els.video, 0);
    recorder.start(200);
    drawLoop();
    await els.video.play();
    await waitForVideoExportEnd(els.video, duration);
    stopped = true;
    cancelAnimationFrame(frameRequest);
    if (recorder.state !== "inactive") recorder.stop();
    await stopPromise;

    const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
    if (!blob.size) throw new Error("视频导出为空，请重新播放后再试");
    const files = [];
    const usedPaths = new Set();
    files.push({
      path: uniqueZipPath(`feedbanner-preview-${state.theme.id}.mp4`, usedPaths),
      data: new Uint8Array(await blob.arrayBuffer()),
    });
    await addThemeDownloadAssets(files, state.theme, usedPaths);
    downloadBlob(createZip(files), `feedbanner-preview-package-${state.theme.id}.zip`);
    updateDownloadStatus("已生成视频效果包 ZIP");
  } finally {
    stopped = true;
    cancelAnimationFrame(frameRequest);
    els.video.loop = previousLoop;
    if (recorder.state !== "inactive") recorder.stop();
    seekVideo(els.video, previousTime).catch(() => {});
    if (!wasPaused) {
      els.video.play().catch(() => {});
    }
  }
}

function preferredMp4MimeType() {
  const types = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1.42001E",
    "video/mp4;codecs=h264",
    "video/mp4",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function seekVideo(video, time) {
  return new Promise((resolve) => {
    if (!Number.isFinite(video.duration) || Math.abs(video.currentTime - time) < 0.03) {
      resolve();
      return;
    }
    const finish = () => {
      video.removeEventListener("seeked", finish);
      resolve();
    };
    video.addEventListener("seeked", finish, { once: true });
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.02));
    setTimeout(finish, 600);
  });
}

function waitForVideoExportEnd(video, duration) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, Math.ceil(duration * 1000) + 160);
    const finish = () => {
      clearTimeout(timeout);
      video.removeEventListener("ended", finish);
      resolve();
    };
    video.addEventListener("ended", finish, { once: true });
  });
}

async function downloadBatchZip() {
  if (!state.batchAssets.length) return;
  els.batchDownloadBtn.disabled = true;
  els.manualDownloadLink.hidden = true;

  try {
    await ensureThemeBasesLoaded();
    const files = [];
    const failures = [];
    const usedPaths = new Set();
    const selectedTheme = state.theme;
    const total = state.batchAssets.length + 2;
    let done = 0;
    let renderedCount = 0;

    await addThemeDownloadAssets(files, selectedTheme, usedPaths);
    done += 2;
    updateBatchUi(`正在生成 ${selectedTheme.name} 背景图和色卡`, done, total);

    for (const file of state.batchAssets) {
      const baseName = cleanFileName(file.name);
      let asset = null;
      try {
        if (file.type.startsWith("video/")) {
          const videoBlob = await renderVideoFilePreview(file, selectedTheme);
          files.push({
            path: uniqueZipPath(`${baseName}__${selectedTheme.id}.mp4`, usedPaths),
            data: new Uint8Array(await videoBlob.arrayBuffer()),
          });
        } else {
          asset = await loadRenderableAsset(file);
          const canvas = renderPreviewCanvas(asset.source, selectedTheme);
          files.push({
            path: uniqueZipPath(`${baseName}__${selectedTheme.id}.png`, usedPaths),
            data: await canvasToBytes(canvas),
          });
        }
        renderedCount += 1;
        updateBatchUi(`正在渲染 ${baseName} · ${selectedTheme.name}`, done + 1, total);
      } catch (error) {
        failures.push({ file: file.name, error: error.message });
        updateBatchUi(`跳过 ${baseName}：${error.message}`, done + 1, total);
      } finally {
        done += 1;
        if (asset) asset.dispose();
      }
    }

    if (!renderedCount) throw new Error("没有成功渲染的素材，请检查 ZIP 内图片或 alpha video 格式");

    const zipBlob = createZip(files);
    downloadBlob(zipBlob, `feedbanner-batch-preview-${selectedTheme.id}.zip`);
    updateBatchUi(
      failures.length
        ? `已生成 ${renderedCount} 个预览文件、背景图和色卡，${failures.length} 个素材失败`
        : `已生成 ${renderedCount} 个 ${selectedTheme.name} 预览文件、背景图和色卡`,
      total,
      total,
    );
  } catch (error) {
    updateBatchUi(`批量生成失败：${error.message}`, 0, 1);
  } finally {
    els.batchDownloadBtn.disabled = state.batchAssets.length === 0;
  }
}

function drawThemeCard(theme) {
  const canvas = document.createElement("canvas");
  canvas.width = 650;
  canvas.height = 884;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.font = "700 24px Arial";
  ctx.fillText(theme.name, 50, 52);

  ctx.beginPath();
  ctx.arc(50, 108, 16, 0, Math.PI * 2);
  ctx.fillStyle = theme.cta;
  ctx.fill();

  const colors = [theme.bgStart, theme.bgMid, theme.bgEnd];
  colors.forEach((color, index) => {
    const x = 88 + index * 172;
    roundedRect(ctx, x, 88, 148, 40, 999);
    ctx.fillStyle = "#e8e8ea";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 20, 108, 15, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#25272d";
    ctx.font = "14px Arial";
    ctx.fillText(`Color${index + 1}:${color.toUpperCase()}`, x + 45, 113);
  });

  ctx.drawImage(drawThemeBackgroundCanvas(theme), 0, 0, 390, 844, 50, 156, 322, 696);
  return canvas;
}

function drawThemeBackgroundCanvas(theme) {
  const canvas = document.createElement("canvas");
  canvas.width = 390;
  canvas.height = 844;
  const ctx = canvas.getContext("2d");
  drawBackground(ctx, theme);
  return canvas;
}

async function addThemeDownloadAssets(files, theme, usedPaths) {
  files.push({
    path: uniqueZipPath(`background-${theme.id}.png`, usedPaths),
    data: await canvasToBytes(drawThemeBackgroundCanvas(theme)),
  });
  files.push({
    path: uniqueZipPath(`color-swatch-${theme.id}.png`, usedPaths),
    data: await canvasToBytes(drawThemeCard(theme)),
  });
}

function drawFigmaBaseCanvas(theme) {
  const canvas = document.createElement("canvas");
  canvas.width = 390;
  canvas.height = 844;
  const ctx = canvas.getContext("2d");
  const baseImage = getThemeBaseImage(theme);
  if (baseImage) {
    ctx.drawImage(baseImage, 0, 0, 390, 844);
  } else {
    drawBackground(ctx, theme);
  }
  return canvas;
}

function drawPaletteSheet() {
  const cardWidth = 260;
  const cardHeight = 420;
  const gap = 18;
  const canvas = document.createElement("canvas");
  canvas.width = themes.length * cardWidth + (themes.length + 1) * gap;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f6f7f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111827";
  ctx.font = "700 18px Arial";
  ctx.fillText("Bg color sample", 18, 30);
  ctx.font = "12px Arial";
  ctx.fillText("feedbanner preview · 7 palettes", 18, 50);

  themes.forEach((theme, index) => {
    const x = gap + index * (cardWidth + gap);
    const y = 78;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.fillStyle = "#111827";
    ctx.font = "700 14px Arial";
    ctx.fillText(theme.name, x + 18, y + 28);

    [theme.cta, theme.bgStart, theme.bgMid, theme.bgEnd].forEach((color, colorIndex) => {
      ctx.beginPath();
      ctx.arc(x + 22 + colorIndex * 54, y + 58, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    const baseImage = getThemeBaseImage(theme);
    if (baseImage) {
      ctx.drawImage(baseImage, 0, 0, 390, 844, x + 18, y + 88, 150, 300);
    } else {
      const gradient = ctx.createLinearGradient(x + 18, y + 88, x + 144, y + 378);
      gradient.addColorStop(0, theme.bgStart);
      gradient.addColorStop(0.48, theme.bgMid);
      gradient.addColorStop(1, theme.bgEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 18, y + 88, 150, 300);
    }
  });

  return canvas;
}

function preloadThemeBases() {
  return Promise.all(themes.map((theme) => loadThemeBase(theme)));
}

function ensureThemeBasesLoaded() {
  const pending = themes
    .filter((theme) => !getThemeBaseImage(theme))
    .map((theme) => loadThemeBase(theme));
  return Promise.all(pending);
}

function areThemeBasesLoaded() {
  return themes.every((theme) => Boolean(getThemeBaseImage(theme)));
}

function loadThemeBase(theme) {
  if (themeBaseImages.has(theme.id)) return themeBaseImages.get(theme.id).promise;
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`${theme.name} Figma 基底图加载失败`));
  });
  image.src = theme.baseSrc;
  themeBaseImages.set(theme.id, { image, promise });
  return promise;
}

function getThemeBaseImage(theme) {
  const record = themeBaseImages.get(theme.id);
  return record?.image?.complete && record.image.naturalWidth ? record.image : null;
}

function canvasToBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvasToBlob(canvas)
      .then(async (blob) => resolve(new Uint8Array(await blob.arrayBuffer())))
      .catch(reject);
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas 导出失败，可能被浏览器安全策略拦截"));
          return;
        }
        resolve(blob);
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function loadRenderableAsset(file) {
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");

  if (isVideo) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.onloadeddata = () => {
        const sourceWidth = video.videoWidth || 390;
        const sourceHeight = video.videoHeight || 330;
        const splitAlpha = isSplitAlphaVideo(sourceWidth, sourceHeight);
        const canvas = document.createElement("canvas");
        canvas.width = splitAlpha ? Math.floor(sourceWidth / 2) : sourceWidth;
        canvas.height = sourceHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (splitAlpha) {
          drawSplitAlphaFrame(ctx, video, sourceWidth, sourceHeight);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          keyBlackToAlpha(ctx, canvas.width, canvas.height);
        }
        resolve({
          source: canvas,
          dispose: () => {
            video.removeAttribute("src");
            URL.revokeObjectURL(url);
          },
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`${file.name} 视频无法解码`));
      };
      video.src = url;
      video.load();
    });
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        source: image,
        dispose: () => URL.revokeObjectURL(url),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} 图片无法解码`));
    };
    image.src = url;
  });
}

async function renderVideoFilePreview(file, theme) {
  if (!("MediaRecorder" in window) || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error("当前浏览器不支持视频导出，请使用新版 Chrome");
  }

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForVideoLoaded(video, file.name);
    const sourceWidth = video.videoWidth || 390;
    const sourceHeight = video.videoHeight || 330;
    const splitAlpha = isSplitAlphaVideo(sourceWidth, sourceHeight);
    const processedCanvas = document.createElement("canvas");
    processedCanvas.width = splitAlpha ? Math.floor(sourceWidth / 2) : sourceWidth;
    processedCanvas.height = sourceHeight;
    const processedCtx = processedCanvas.getContext("2d", { willReadFrequently: true });

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = PREVIEW_WIDTH * EXPORT_SCALE;
    outputCanvas.height = PREVIEW_HEIGHT * EXPORT_SCALE;
    const outputCtx = outputCanvas.getContext("2d");
    outputCtx.scale(EXPORT_SCALE, EXPORT_SCALE);
    const stream = outputCanvas.captureStream(30);
    const mimeType = preferredMp4MimeType();
    if (!mimeType) throw new Error("当前浏览器不支持 MP4 视频导出，请使用支持 MP4 MediaRecorder 的新版 Chrome 或 Safari");
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];
    let frameRequest = 0;
    let stopped = false;

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    const stopPromise = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = () => reject(new Error(`${file.name} 视频录制失败`));
    });

    const drawLoop = () => {
      if (video.readyState >= 2) {
        processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
        if (splitAlpha) {
          drawSplitAlphaFrame(processedCtx, video, sourceWidth, sourceHeight);
        } else {
          processedCtx.drawImage(video, 0, 0, processedCanvas.width, processedCanvas.height);
          keyBlackToAlpha(processedCtx, processedCanvas.width, processedCanvas.height);
        }
        drawPreviewFrame(outputCtx, processedCanvas, theme, { shadow: false });
      }
      if (!stopped) frameRequest = requestAnimationFrame(drawLoop);
    };

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 3;
    await seekVideo(video, 0);
    recorder.start(200);
    drawLoop();
    await video.play();
    await waitForVideoExportEnd(video, duration);
    stopped = true;
    cancelAnimationFrame(frameRequest);
    if (recorder.state !== "inactive") recorder.stop();
    await stopPromise;

    const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
    if (!blob.size) throw new Error(`${file.name} 视频导出为空`);
    return blob;
  } finally {
    video.pause();
    video.removeAttribute("src");
    URL.revokeObjectURL(url);
  }
}

function waitForVideoLoaded(video, fileName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("error", handleError);
    };
    const handleLoaded = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`${fileName} 视频无法解码`));
    };
    video.addEventListener("loadeddata", handleLoaded, { once: true });
    video.addEventListener("error", handleError, { once: true });
    video.load();
  });
}

function downloadBlob(blob, fileName) {
  if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
  const url = URL.createObjectURL(blob);
  state.downloadUrl = url;
  els.manualDownloadLink.href = url;
  els.manualDownloadLink.download = fileName;
  els.manualDownloadLink.hidden = false;
  downloadDataUrl(url, fileName);
}

function downloadDataUrl(url, fileName) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function dataUrlToBlob(dataUrl) {
  const [meta, payload] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(meta)?.[1] || "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function ctaTextColor(theme) {
  return theme.id === "yellow" ? "#111827" : "#fff";
}

async function readZipFiles(buffer) {
  const view = new DataView(buffer);
  const decoder = new TextDecoder();
  const eocdOffset = findSignature(view, 0x06054b50, Math.max(0, view.byteLength - 66000));
  if (eocdOffset < 0) throw new Error("找不到 ZIP 目录");

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  const entries = [];
  let offset = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("ZIP 目录结构异常");
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const nameBytes = new Uint8Array(buffer, offset + 46, nameLength);
    const name = decoder.decode(nameBytes);
    offset += 46 + nameLength + extraLength + commentLength;

    if (name.endsWith("/")) continue;
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error(`${name} 本地文件头异常`);

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(buffer, dataStart, compressedSize);
    const data = method === 0 ? compressed : await inflateZipEntry(compressed, method, name);
    entries.push({ name, data });
  }

  return entries;
}

function findSignature(view, signature, start) {
  for (let offset = view.byteLength - 4; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === signature) return offset;
  }
  return -1;
}

async function inflateZipEntry(bytes, method, name) {
  if (method !== 8) throw new Error(`${name} 使用了暂不支持的 ZIP 压缩方式`);
  if (!("DecompressionStream" in window)) {
    throw new Error("当前浏览器不支持解压 deflate ZIP，请使用未压缩 ZIP 或新版 Chrome");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path);
    const dataBytes =
      typeof file.data === "string"
        ? encoder.encode(file.data)
        : file.data instanceof Uint8Array
          ? file.data
          : new Uint8Array(file.data);
    const crc = crc32(dataBytes);
    const timestamp = dosTime();
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const local = new DataView(localHeader.buffer);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, timestamp.time, true);
    local.setUint16(12, timestamp.date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, dataBytes.length, true);
    local.setUint32(22, dataBytes.length, true);
    local.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const central = new DataView(centralHeader.buffer);
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, timestamp.time, true);
    central.setUint16(14, timestamp.date, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, dataBytes.length, true);
    central.setUint32(24, dataBytes.length, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, centralSize, true);
  eocdView.setUint32(16, centralOffset, true);

  return new Blob([...localParts, ...centralParts, eocd], { type: "application/zip" });
}

function dosTime(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = crcTable[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

els.input.addEventListener("change", (event) => handleAssetInput(event.target.files[0]));
els.batchDownloadBtn.addEventListener("click", downloadBatchZip);
els.fitButtons.forEach((button) => {
  button.addEventListener("click", () => setFit(button.dataset.fit));
});
els.scaleRange.addEventListener("input", syncPlacement);
els.xRange.addEventListener("input", syncPlacement);
els.yRange.addEventListener("input", syncPlacement);
els.guideToggle.addEventListener("change", () => {
  els.heroSlot.classList.toggle("guide-off", !els.guideToggle.checked);
});
els.heroSlot.addEventListener("click", () => {
  if (state.assetType === "video") {
    els.video.play().catch(() => {
      updateDownloadStatus("浏览器阻止了视频播放，请点击预览区或重新选择视频");
    });
  }
});
els.downloadBtn.addEventListener("click", downloadPreview);
window.addEventListener("resize", updatePreviewScale);

initThemes();
setTheme("red");
setFit("contain");
syncPlacement();
requestAnimationFrame(updatePreviewScale);
els.heroSlot.classList.add("asset-contain");
preloadThemeBases().catch((error) => {
  updateBatchUi(error.message, 0, 1);
});
