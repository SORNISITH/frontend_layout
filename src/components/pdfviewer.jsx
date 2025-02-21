// npm install pdfjs-dist --save-dev
//
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef } from "react";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

async function loadPdf(url) {
  const pdf = pdfjsLib.getDocument(url);
  const PDF = await pdf.promise;
  return PDF;
}
export default function PdfViewer() {
  // point to canvas for display PDF

  const url = "/Eloquent_JavaScript.pdf";
  const canvasRef = useRef(null);
  const scale = 1;
  const pageNumber = 1;

  async function PAGE(n, url, scale) {
    const _pdf = await loadPdf(url);
    const _page = await _pdf.getPage(n);

    const viewport = _page.getViewport({ scale: scale });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await _page.render(renderContext).promise;
  }
  useEffect(() => {
    PAGE(pageNumber, url, scale);
  }, []);
  return (
    <div className="h-full">
      <h1 className="text-2xl  ">pdf viewer</h1>
      <canvas
        className="overflow-scroll"
        ref={canvasRef}
        id="canvas-pdf"
      ></canvas>
    </div>
  );
}
